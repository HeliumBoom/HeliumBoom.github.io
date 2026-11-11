# Personal Blog Implementation Plan

> **For agentic workers:** Implement inline using the executing-plans workflow. Reuse this empty checkout; user requested the foundation and related commits.

**Goal:** Deliver a Chinese personal homepage and technical blog to HeliumBoom.github.io.

**Architecture:** Adapt the pinned AstroPaper template while retaining its static content pipeline. Customize branding and translations; deploy built output through GitHub Actions.

**Tech Stack:** Astro, AstroPaper, TypeScript, Tailwind CSS, Pagefind, Markdown/MDX, Node.js 24.

**Spec:** `docs/superpowers/specs/2026-11-11-personal-blog-design.md`

## Global Constraints

- Site URL `https://heliumboom.github.io/`; language `zh-CN`; timezone `Asia/Shanghai`.
- Preserve upstream MIT license; remove upstream demo content and personal accounts.
- No invented biography, private work material, backend, analytics or third-party credentials.
- Keep source and dependency lockfile; ignore build/cache output.

## Review Focus

- Chinese search must work after a production build, including its static index assets.
- Draft and future content must not leak into public routes, search, RSS or sitemap.
- Repository-root hosting must not accidentally include `/HeliumBoom.github.io/` in URLs.
- Chinese article headings, wide code blocks and navigation must be usable on narrow screens.
- Builds must not depend on downloading Google fonts or the original author's services.

## Task 1: Theme, content and localization

- [x] Import selected theme source and license from the pinned snapshot, excluding demo posts, screenshots and upstream workflows.
- [x] Configure `astro-paper.config.ts`, Astro locale and system fonts. Add `src/i18n/lang/zh-CN.ts`.
- [x] Customize homepage, about page, favicon, share image and one substantive site-introduction article.
- [x] Install locked dependencies and run the template's type check and production build. Inspect any failures before changing code.

## Task 2: Publishing and authoring

- [x] Add `.github/workflows/deploy.yml` for checked builds on PR and automatic Pages deployment from main.
- [x] Write README with setup, writing, previews, dates/drafts, configuration and deployment troubleshooting.
- [x] Add a small meaningful built-site verification script for routes, internal links, identity, feed, sitemap and search index; run it against real output.

## Task 3: Verify and deliver

- [x] Inspect desktop/mobile previews, dark mode, Chinese search and article reading interactions.
- [x] Obtain an independent code review and resolve material findings.
- [ ] Run final checks, inspect staged files, commit the site and deployment configuration.
- [ ] Push to the provided remote without force; configure Pages if existing credentials allow and observe deployment result.
- [ ] Record exact verification and any remaining manual step in the final response.
