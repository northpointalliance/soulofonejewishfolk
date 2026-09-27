# Architecture

## Overview

`soulofonejewishfolk` is a repository for Torah teachings by Daniel Rosenthal. The project is currently a minimal content repository, so this document records the intended structure and conventions as the project develops.

## Repository Structure

```text
.
├── content/
│   ├── teachings/      # One Markdown file per teaching (_template.md is the starter)
│   └── pages/          # Standalone pages (about.md)
├── public/             # Copied as-is: styles.css, favicon.svg, _headers
├── scripts/build.mjs   # Static site generator (only dependency: marked)
├── site.config.json    # Title, tagline, disclaimer, author, canonical URL
├── package.json
└── dist/               # Build output (git-ignored), served by Cloudflare Pages
```

## Deployment

Cloudflare Pages, Git-connected to `main`. Build command `npm run build`, output `dist`, `NODE_VERSION=22`.
Pure static output: no Pages Functions, no Workers, no bindings, no secrets.

## Generated output

- `/`, `/teachings/`, `/teachings/<slug>/`, `/about/`, `404.html`
- `sitemap.xml`, `feed.xml` (RSS), `robots.txt`, `llms.txt`
- Schema.org JSON-LD (WebSite, Article, AboutPage) and Open Graph tags for search and AI answer engines
- Hebrew runs are auto-wrapped with `dir="rtl"` and a Hebrew font

## Content Principles

- Keep Torah teachings in a format that is easy to read, review, and preserve.
- Store media separately from written content and use descriptive filenames.
- Keep generated files and local development artifacts out of version control.
- Preserve authorship and source information for every published teaching.

## Change Management

- Update this document when the repository gains a significant new component or workflow.
- Prefer small, focused commits with clear messages.
- Review published content for accuracy, attribution, and formatting before release.

## Current Status

Static site generator and Cloudflare Pages configuration in place. No teachings published yet.
# Architecture

## Overview

`soulofonejewishfolk` is a repository for Torah teachings by Daniel Rosenthal. The project is currently a minimal content repository, so this document records the intended structure and conventions as the project develops.

## Repository Structure

```text
.
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

As content and supporting tools are added, organize them by purpose. For example:

```text
.
├── content/        # Torah teachings and related source material
├── media/          # Images, audio, and other media
├── scripts/        # Optional utilities for validation or publishing
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

## Content Principles

- Keep Torah teachings in a format that is easy to read, review, and preserve.
- Store media separately from written content and use descriptive filenames.
- Keep generated files and local development artifacts out of version control.
- Preserve authorship and source information for every published teaching.

## Change Management

- Update this document when the repository gains a significant new component or workflow.
- Prefer small, focused commits with clear messages.
- Review published content for accuracy, attribution, and formatting before release.

## Current Status

The repository does not yet contain an application runtime or deployment architecture. Any future website, publishing workflow, or automation should be documented here as it is introduced.
