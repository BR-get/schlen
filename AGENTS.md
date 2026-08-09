# AGENTS.md

Schlen联邦共和国 — a fictional micronation's static website (plain HTML/CSS/JS), deployed to GitHub Pages at `schlen.top`.

## Start here

- **`CLAUDE.md` is the detailed design spec** (page list, conventions, wallet API). Read it first. It is mostly accurate but slightly stale — corrections noted below.
- **No build/test/lint/package manager.** No package.json, no CI config in-repo, no dev server. Edit files, commit to `main`, GitHub Pages auto-deploys (CNAME `schlen.top`, repo `BR-get/schlen`).

## Architecture (not obvious from filenames)

- Every page except `404.html` has a **bare `<head>`** (meta/OG/favicon/`style.css` only). `components.js` injects all CDN assets at runtime: Font Awesome 6.5.1, MiSans@4.1.0, Pacifico, Waline CSS via `injectCommonHead()`; GA `G-BCG1K6EZ72` via `initGA()`; Waline via `initWaline()` (auto-detects `<div id="waline">`, server `https://blogwaline-gamma.vercel.app`).
- Standard pages call `initPage('pageId')` at body end → renders `#header-root`/`#footer-root`/`#modal-root` and wires theme toggle + join modal. New-page recipe is in CLAUDE.md.
- **`components.js` redirects extensionless URLs to `.html`** (e.g. `/about` → `/about.html`).
- `404.html` is fully standalone: no components.js, no header/footer, loads FA/fonts itself.
- `style.css` is the **only stylesheet** (~2400 lines), organized by `/* ===== Page Styles ===== */` sections. Dark mode lives under `[data-theme="dark"]`. Wallet uses its own `wallet-page`/`wallet-box` namespace.

## Non-standard pages (keep their structure)

- **`pride.html`** — missing from CLAUDE.md's page table. Calls components functions individually (no `initPage()`), has **no footer**, not in NAV_ITEMS/FOOTER_LINKS.
- **`wallet.html`** — most complex; does **not** use `initPage()` (no header/modal). Also calls `injectCommonHead()` + `initGA()` (CLAUDE.md omits these), then inline wallet logic. API base `https://coin.schlen.top`: `/balance`, `/users`, `/userinfo`, `/transfer`, `/mint`, `/admin`. API keys starting `brkey_` are user keys; anything else is admin. **BR-penkein-coin is NOT a blockchain** — never use ledger/mining/chain wording.

## Gotchas

- **Population = 3 (当前登记公民3人)** — currently in `index.html` and `about.html` only (NOT citizens.html, contrary to CLAUDE.md). Grep for `3人` before changing it.
- Pinned CDN versions (FA 6.5.1, misans@4.1.0, Waline v2) exist in **two places**: `style.css` `@import` and `components.js` `injectCommonHead()`. Keep in sync.
- Files are UTF-8 Chinese; on this Windows box PowerShell `Select-String`/console prints mojibake — use Read/Grep tools instead of the shell for searching.
- Key external links: Telegram `https://t.me/+a7w9EUeKBThlY2Y5`, shop `https://shop.schlen.top`, Schlenix `https://ix.schlen.top` (all in FOOTER_LINKS).
- CLAUDE.md's "喵喵喵 cat-speak" reply rule is Claude Code-specific; do not adopt it in OpenCode output.
