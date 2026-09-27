// Builds the static site into dist/ for Cloudflare Pages.
// Pages settings: build command `npm run build`, output directory `dist`.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const site = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const base = site.url.replace(/\/$/, "");
const year = new Date().getFullYear();

// ---------- helpers ----------
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function parseFile(path) {
  const raw = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {};
  let body = raw;
  if (m) {
    body = m[2];
    for (const line of m[1].split("\n")) {
      const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
      if (!kv) continue;
      let v = kv[2].trim();
      if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map((t) => t.trim()).filter(Boolean);
      else if (v === "true" || v === "false") v = v === "true";
      else v = v.replace(/^["']|["']$/g, "");
      meta[kv[1]] = v;
    }
  }
  return { meta, body };
}

// Hebrew runs get dir="rtl" + Hebrew font so mixed paragraphs read correctly.
function markHebrew(html) {
  return html.replace(/(>[^<]*)/g, (seg) =>
    seg.replace(/([֐-׿][֐-׿\s־׳״'".,:;־]*[֐-׿])/g, '<span class="he" lang="he" dir="rtl">$1</span>')
  );
}

const fmtDate = (d) =>
  d ? new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }) : "";

function write(rel, content) {
  const out = join(DIST, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, content);
}

function layout({ title, description, path, body, jsonld, type = "website" }) {
  const full = title === site.title ? site.title : `${title} | ${site.title}`;
  const canonical = base + path;
  return `<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(site.author)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${esc(site.title)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${esc(site.title)}" href="/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">${esc(site.title)}</a>
    <nav><a href="/teachings/">Teachings</a><a href="/about/">About</a></nav>
  </div>
</header>
<main id="main" class="wrap">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <p class="disclaimer">${esc(site.disclaimer)}</p>
    <p>&copy; ${year} ${esc(site.author)} · <a href="/feed.xml">RSS</a></p>
  </div>
</footer>
</body>
</html>`;
}

const card = (t) => `<article class="card">
  <p class="meta">${[t.parsha ? `Parashat ${esc(t.parsha)}` : "", fmtDate(t.date)].filter(Boolean).join(" · ")}</p>
  <h3><a href="/teachings/${t.slug}/">${esc(t.title)}</a></h3>
  ${t.summary ? `<p>${esc(t.summary)}</p>` : ""}
</article>`;

// ---------- load content ----------
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, "public"), DIST, { recursive: true });

const tDir = join(ROOT, "content/teachings");
const teachings = readdirSync(tDir)
  .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
  .map((f) => {
    const { meta, body } = parseFile(join(tDir, f));
    const slug = f.replace(/\.md$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    if (!meta.title) throw new Error(`${f}: missing "title" at the top of the file`);
    if (meta.date && !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`${f}: date must look like 2026-10-01`);
    return { ...meta, slug, html: markHebrew(marked.parse(body)) };
  })
  .filter((t) => !t.draft)
  .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

const author = { "@type": "Person", name: site.author, url: `${base}/about/` };

// ---------- teaching pages ----------
for (const t of teachings) {
  const path = `/teachings/${t.slug}/`;
  const tags = Array.isArray(t.tags) ? t.tags : t.tags ? [t.tags] : [];
  write(`teachings/${t.slug}/index.html`, layout({
    title: t.title,
    description: t.summary || `${t.title}, a Torah teaching by ${site.author}.`,
    path,
    type: "article",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t.title,
      description: t.summary,
      datePublished: t.date,
      author,
      publisher: author,
      inLanguage: site.language,
      about: t.parsha ? `Parashat ${t.parsha}` : undefined,
      keywords: tags.join(", ") || undefined,
      mainEntityOfPage: base + path,
    },
    body: `<article class="teaching">
  <header>
    <p class="meta">${[t.parsha ? `Parashat ${esc(t.parsha)}` : "", t.date ? `<time datetime="${t.date}">${fmtDate(t.date)}</time>` : ""].filter(Boolean).join(" · ")}</p>
    <h1>${esc(t.title)}</h1>
    <p class="byline">By ${esc(site.author)}</p>
  </header>
  <div class="prose">${t.html}</div>
  ${tags.length ? `<p class="tags">${tags.map((x) => `<span>${esc(x)}</span>`).join("")}</p>` : ""}
  <aside class="note">${esc(site.disclaimer)}</aside>
  <p><a href="/teachings/">&larr; All teachings</a></p>
</article>`,
  }));
}

// ---------- teachings index ----------
const empty = `<p class="empty">Teachings are on their way. Check back soon.</p>`;
write("teachings/index.html", layout({
  title: "Teachings",
  description: `All Torah teachings by ${site.author}.`,
  path: "/teachings/",
  body: `<h1>Teachings</h1>\n<div class="list">${teachings.map(card).join("\n") || empty}</div>`,
}));

// ---------- home ----------
write("index.html", layout({
  title: site.title,
  description: `${site.tagline}. ${site.disclaimer}`,
  path: "/",
  jsonld: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.title,
    url: base + "/",
    description: site.tagline,
    author,
    inLanguage: site.language,
  },
  body: `<section class="hero">
  <h1>${esc(site.title)}</h1>
  <p class="lede">${esc(site.tagline)}</p>
  <p class="small">${esc(site.disclaimer)}</p>
</section>
<section>
  <h2>Recent teachings</h2>
  <div class="list">${teachings.slice(0, 6).map(card).join("\n") || empty}</div>
  ${teachings.length > 6 ? `<p><a href="/teachings/">All teachings &rarr;</a></p>` : ""}
</section>`,
}));

// ---------- standalone pages (about, etc.) ----------
const pDir = join(ROOT, "content/pages");
const pages = [];
for (const f of readdirSync(pDir).filter((f) => f.endsWith(".md") && !f.startsWith("_"))) {
  const { meta, body } = parseFile(join(pDir, f));
  const slug = f.replace(/\.md$/, "");
  pages.push(slug);
  write(`${slug}/index.html`, layout({
    title: meta.title || slug,
    description: meta.summary || site.tagline,
    path: `/${slug}/`,
    jsonld: slug === "about" ? { "@context": "https://schema.org", "@type": "AboutPage", mainEntity: author } : undefined,
    body: `<article class="teaching"><h1>${esc(meta.title || slug)}</h1><div class="prose">${markHebrew(marked.parse(body))}</div></article>`,
  }));
}

// ---------- 404 ----------
write("404.html", layout({
  title: "Page not found",
  description: "This page does not exist.",
  path: "/404",
  body: `<h1>Page not found</h1><p>That page isn't here. Try the <a href="/teachings/">teachings list</a>.</p>`,
}));

// ---------- sitemap, RSS, robots, llms.txt ----------
const urls = ["/", "/teachings/", ...pages.map((p) => `/${p}/`), ...teachings.map((t) => `/teachings/${t.slug}/`)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join("\n")}
</urlset>`);

write("feed.xml", `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(site.title)}</title><link>${base}/</link><description>${esc(site.tagline)}</description><language>${site.language}</language>
${teachings.map((t) => `<item><title>${esc(t.title)}</title><link>${base}/teachings/${t.slug}/</link><guid>${base}/teachings/${t.slug}/</guid>${t.date ? `<pubDate>${new Date(t.date + "T12:00:00Z").toUTCString()}</pubDate>` : ""}<description>${esc(t.summary || "")}</description></item>`).join("\n")}
</channel></rss>`);

write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);

write("llms.txt", `# ${site.title}

> ${site.tagline}. ${site.disclaimer}

## Teachings
${teachings.map((t) => `- [${t.title}](${base}/teachings/${t.slug}/)${t.summary ? `: ${t.summary}` : ""}`).join("\n") || "- (none published yet)"}

## About
- [About the author](${base}/about/)
`);

console.log(`Built ${teachings.length} teaching(s), ${pages.length} page(s) into dist/`);
