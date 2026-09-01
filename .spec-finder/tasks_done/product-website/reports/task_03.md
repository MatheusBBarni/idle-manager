# Task 03 Final Report: Ship the Portuguese landing and locale links

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` worker (not ACP runtime)

## Changes

- `site/astro.config.mjs` — Astro i18n: `defaultLocale: 'en'`, `locales: ['en','pt']`, `prefixDefaultLocale: true`. `redirectToDefaultLocale: false` so the required index route can own `/`.
- `site/src/pages/pt/index.astro` — Portuguese isolation-vs-bot landing aligned to English claims.
- `site/src/pages/index.astro` — `Astro.redirect(getRelativeLocaleUrl('en'))` so `/idle-manager/` → `/idle-manager/en/`.
- `site/src/layouts/Landing.astro` — Locale `<a>` links via `getRelativeLocaleUrl`; skip/in-page nav copy per locale.
- `memory/MEMORY.md`, `memory/task_03.md` — i18n + redirect decision.

Not changed: `src/main/**`, `src/renderer/**`, `vitest.config.ts`, root `package.json` scripts, `site/src/lib/selectWindowsDownload.ts`, `.spec-finder/config.json` (unrelated dirty preserved). No privacy, LICENSE, Download probe, or Pages workflow.

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Portuguese landing at `/pt/` with isolation-vs-bot claims aligned to English | satisfied | `pnpm --dir site build` emitted `site/dist/pt/index.html`. Built `<h1>Idle manager é um shell local de várias contas.</h1>` plus “Não automatiza o jogo, não injeta cheats, não falsifica fingerprints, não usa proxies e não compartilha um único cookie jar.” Not-a-bot list covers bot/macro, cheat injector, fingerprint spoof, proxy/anti-detect, shared cookie-jar swapper. English `dist/en/index.html` claims unchanged. |
| 2. Redirect `/idle-manager/` to `/idle-manager/en/` | satisfied | Built `site/dist/index.html` is Astro redirect HTML: `Redirecting to: /idle-manager/en/`, `meta http-equiv="refresh" content="2;url=/idle-manager/en/"`, canonical `https://matheusbarni.github.io/idle-manager/en/`. |
| 3. `prefixDefaultLocale` / locale prefixes; language switch is `<a>` links, not client storage | satisfied | `astro.config.mjs` has `prefixDefaultLocale: true`. Layout uses `<a href={getRelativeLocaleUrl('en')}>English</a>` and `<a href={getRelativeLocaleUrl('pt')}>Português</a>`. No localStorage/sessionStorage/cookie for locale. |
| 4. Prefix internal locale links with `base` | satisfied | Built EN and PT HTML locale hrefs are `/idle-manager/en/` and `/idle-manager/pt/`. |
| 5. Keyboard access to locale links | satisfied | Locale links are real `<a>` in header nav with `:focus-visible` outline. No browser session; evidence is built HTML. |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm --dir site build` | pass | Exit 0. Log: `output: "static"`, `├─ /en/index.html`, `├─ /pt/index.html`, `├─ /index.html`, `3 page(s) built`. No dual-owner `/` warning after explicit redirect. |
| Built PT + EN indexes under base | pass | `site/dist/en/index.html` and `site/dist/pt/index.html` exist; stylesheet/icon hrefs remain `/idle-manager/_astro/...` and `/idle-manager/icon.png`. |
| Root redirect | pass | `site/dist/index.html` redirects to `/idle-manager/en/`. |
| Locale link hrefs | pass | Both locales: English → `/idle-manager/en/`, Português → `/idle-manager/pt/`. |
| `pnpm test` | pass | Exit 0. Vitest v3.2.7: 4 files, 19 tests passed (partition, i18n, layout, workspace). Duration 206ms. |
| `pnpm --dir site test` (unchanged picker) | pass | Exit 0. 1 file, 7 tests passed. |
| Keyboard / browser | documented limitation | No browser in this environment. Built HTML has skip link, in-page `#isolation`/`#not-a-bot`, and locale `<a>` with visible focus style. |

## Risks and Follow-ups

- Keyboard usability not exercised in a real browser; HTML structure is the evidence for US-07 this slice.
- Privacy/MIT/source remain task_04; Download probe task_05; Pages workflow task_06.
- `redirectToDefaultLocale` is left false on purpose; changing it back without removing `src/pages/index.astro` reintroduces the dual-owner `/` build warning.

## Final Verdict

completed — `pnpm --dir site build` emits Portuguese `/idle-manager/pt/` isolation-vs-bot copy, English `/idle-manager/en/`, base-prefixed locale `<a>` links both ways, and a root redirect from `/idle-manager/` to `/idle-manager/en/`, with root `pnpm test` still green.
