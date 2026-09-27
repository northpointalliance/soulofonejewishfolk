# Soul of One Jewish Folk

Torah teachings by Daniel Rosenthal. I am not a Rabbi.

## Add a teaching

1. Copy `content/teachings/_template.md` and rename it, e.g. `noach-the-rainbow.md` (the file name becomes the web address).
2. Fill in `title`, `date`, `parsha`, `summary`, `tags` at the top. Remove `draft: true`.
3. Write the teaching below the `---` line. Commit to `main`. Cloudflare Pages publishes it in about a minute.

Files starting with `_`, or marked `draft: true`, are never published.

## Cloudflare Pages settings

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (leave blank) |
| Environment variable | `NODE_VERSION` = `22` |

This is a Pages project only. No Worker, no `wrangler deploy`.

When the custom domain is live, change `url` in `site.config.json` so the sitemap, RSS and canonical links use it.
# soulofonejewishfolk
Torahs by Daniel Rosenthal, I am not a Rabbi
