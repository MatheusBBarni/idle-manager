# Task 04 Final Report: Ship privacy copy, MIT LICENSE, and source link

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` worker (not ACP runtime)

## Changes

- `LICENSE` — MIT at repo root; `Copyright (c) 2026 Idle manager`; matches `package.json` `"license": "MIT"`.
- `site/src/pages/en/index.astro` — English privacy (device sessions, Pages IP logs, GitHub Releases API GET, no extra pixels) and source link.
- `site/src/pages/pt/index.astro` — Portuguese privacy and source link with the same claims.
- `site/src/layouts/Landing.astro` — Keyboard-reachable `#privacy` / `#source` nav links; `.legal` styles.
- `memory/MEMORY.md`, `memory/task_04.md` — Privacy/source placement and LICENSE.

Not changed: `src/main/**`, `src/renderer/**`, `vitest.config.ts`, root `package.json` scripts, `site/src/lib/selectWindowsDownload.ts`, `.github/workflows/**`, `.spec-finder/config.json` (unrelated dirty preserved). No Download probe and no analytics pixels.

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Privacy copy on EN and PT: app-local sessions, Pages/host IP logging, GitHub API GET | satisfied | Built `site/dist/en/index.html`: “Game sessions stay on this device”, “GitHub Pages”, “may log visitor IPs”, “GET GitHub’s Releases API at api.github.com”, “no extra tracking pixels”. Built `site/dist/pt/index.html`: “sessões de jogo ficam neste dispositivo”, “GitHub Pages”, “registrar IPs”, “GET na API de Releases do GitHub em api.github.com”, “Não há pixels de rastreamento extras”. |
| 2. Root `LICENSE` MIT matching `package.json` | satisfied | `LICENSE` first line `MIT License`. `package.json` `"license": "MIT"`. |
| 3. GitHub source link on both locales; no macOS/Linux installer buttons | satisfied | Both built pages contain exactly one `https://github.com/MatheusBBarni/idle-manager` `<a>`. No macOS/Linux installer controls in HTML. |
| 4. No third-party analytics pixels | satisfied | Built EN/PT `<head>` is charset, viewport, description, title, favicon, one same-origin stylesheet. Zero `<script>` tags. Tracker grep (gtag, google-analytics, googletagmanager, facebook.net, hotjar, plausible, segment.com): none. |
| 5. Privacy and source keyboard-reachable | satisfied | Header nav includes `#privacy` and `#source` `<a>` links with existing `:focus-visible` outline. No browser session; evidence is built HTML. |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm --dir site build` | pass | Exit 0. Log: `output: "static"`, `├─ /en/index.html`, `├─ /pt/index.html`, `├─ /index.html`, `3 page(s) built`. |
| Built EN/PT privacy + source | pass | Both `dist/en/index.html` and `dist/pt/index.html` include source URL, local-session copy, GitHub Pages IP logging, and `api.github.com`. |
| `LICENSE` MIT | pass | File exists at repo root; first line `MIT License`. |
| Tracker grep on built HTML | pass | gtag, google-analytics, googletagmanager, facebook.net, hotjar, plausible, segment.com: none. `<script>` count 0 on EN and PT. |
| `pnpm test` | pass | Exit 0. Vitest v3.2.7: 4 files, 19 tests passed (partition, i18n, layout, workspace). Duration 211ms. |
| Keyboard / browser | documented limitation | No browser in this environment. Built HTML has `#privacy`/`#source` nav `<a>` with visible focus style. |

## Risks and Follow-ups

- Keyboard usability not exercised in a real browser; HTML structure is the evidence for US-07 this slice.
- GitHub repo `license` metadata populates only after `LICENSE` is pushed (ops, not this task’s CI).
- Download probe and SmartScreen remain task_05; Pages workflow remains task_06.

## Final Verdict

completed — English and Portuguese landings disclose app-local sessions, GitHub Pages IP logging, and a possible GET to GitHub’s Releases API, with a GitHub source link and no extra pixels; root `LICENSE` is MIT; `pnpm --dir site build` and root `pnpm test` are green.
