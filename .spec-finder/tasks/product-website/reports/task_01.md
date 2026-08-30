# Task 01 Final Report: Ship the English isolation landing

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` worker (not ACP runtime)

## Changes

- `site/package.json` — New Astro package; `build`/`dev`/`preview` scripts; esbuild allowlisted for pnpm v11.
- `site/pnpm-workspace.yaml` — Nested workspace so `pnpm --dir site` does not hitch the Electron root.
- `site/pnpm-lock.yaml` — Site lockfile.
- `site/astro.config.mjs` — `site: https://matheusbarni.github.io`, `base: '/idle-manager'`, `output: 'static'`, `trailingSlash: 'always'`. No i18n, no SSR adapter.
- `site/tsconfig.json` — Extends `astro/tsconfigs/strict`.
- `site/.gitignore` — Ignores generated `.astro/`.
- `site/src/layouts/Landing.astro` — Shared shell: semantic header/nav, skip link, no analytics tags.
- `site/src/pages/en/index.astro` — English isolation-vs-bot landing.
- `site/public/icon.png` — App icon (copied from `assets/icon.png`).
- `memory/MEMORY.md`, `memory/task_01.md` — Nested workspace + deferred i18n.

Not changed: `src/main/**`, `src/renderer/**`, `vitest.config.ts`, root `package.json` scripts, `.spec-finder/config.json` (unrelated dirty preserved).

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Static Astro app at `site/` with TechSpec `site`/`base`; English under `/idle-manager/en/` | satisfied | `site/astro.config.mjs` sets `site: 'https://matheusbarni.github.io'`, `base: '/idle-manager'`. `pnpm --dir site build` emitted `site/dist/en/index.html`; stylesheet/icon hrefs are `/idle-manager/_astro/...` and `/idle-manager/icon.png`. No `dist/index.html` or `dist/pt/`. |
| 2. Isolation-vs-bot copy in first English content; no `pnpm dev` as player path | satisfied | Built `<h1>Idle manager is a local multi-account shell.</h1>` plus “does not automate play, inject cheats, spoof fingerprints, use proxies, or share one cookie jar.” Grep of built HTML: `pnpm dev` absent. |
| 3. Keep site out of Electron | satisfied | Git status shows `site/` untracked plus packet files only. `vitest.config.ts` still `include: ['src/shared/**/*.test.ts']`. Root `pnpm test` ran 19 shared tests, 4 files. |
| 4. No third-party analytics pixels | satisfied | Built `<head>` contains charset, viewport, description, title, favicon, one same-origin stylesheet. No gtag/GA/GTM/hotjar/plausible/segment/facebook snippets. Fonts are bundled `@fontsource/*`, not a Google Fonts request. |
| 5. Semantic HTML and keyboard-reachable in-page links | satisfied | Skip link `href="#isolation"`; nav “Isolation” / “What it is not”; `:focus-visible` outline. No browser was available; keyboard pass is HTML inspection. |
| 6. Merge `site/package.json` if it already exists | satisfied | File did not exist; created with `dev`/`build`/`preview` only (no `test` script, so task_02 can merge). |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm --dir site build` | pass | Exit 0. Log: `output: "static"`, `├─ /en/index.html`, `1 page(s) built`. |
| Built English index claims | pass | `site/dist/en/index.html` contains product name + not-a-bot list (quoted above). |
| Tracker grep on built HTML | pass | gtag, google-analytics, googletagmanager, facebook.net, hotjar, plausible, segment.com: MISS. |
| `pnpm test` | pass | Exit 0. Vitest v3.2.7: 4 files, 19 tests passed (partition, i18n, layout, workspace). Duration 218ms. |
| Root Vitest include | pass | `vitest.config.ts` unchanged: `src/shared/**/*.test.ts` only. |
| Keyboard / browser | documented limitation | No browser in this environment. Built HTML has skip link, in-page `#isolation`/`#not-a-bot`, visible focus style. |

## Risks and Follow-ups

- Keyboard usability not exercised in a real browser; HTML structure is the evidence for US-07 this slice.
- Astro i18n, `/` → `/en/`, PT copy, privacy/MIT/source, Download probe, and Pages workflow remain later tasks.
- `site/` is not in the Electron pnpm workspace; CI/task_06 should install with `pnpm --dir site` against `site/pnpm-lock.yaml`.

## Final Verdict

completed — `pnpm --dir site build` emits `/idle-manager/en/` English HTML whose first main content names Idle manager as a local multi-account shell and states the not-a-bot claims, with no analytics pixels and root `pnpm test` still green on `src/shared/**/*.test.ts` only.
