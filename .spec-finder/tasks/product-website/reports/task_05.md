# Task 05 Final Report: Wire Download probe and SmartScreen warning

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` worker (not ACP runtime)

## Changes

- `site/src/layouts/Landing.astro` — Always-on Download `<a>` (default href = TechSpec `fallbackDownload`), SmartScreen copy in EN and PT, keyboard nav `#download`, processed client `<script>` that runs the probe once.
- `site/src/lib/probeWindowsDownload.ts` — One unauthenticated `GET` of TechSpec `api` with `Accept: application/vnd.github+json`; applies `selectWindowsDownload`; no token, no retry.
- `memory/MEMORY.md`, `memory/task_05.md` — Probe path and inlined-script handoff.

Not changed: `site/src/lib/selectWindowsDownload.ts` (consumed only), `src/main/**`, `src/renderer/**`, `vitest.config.ts`, root `package.json` scripts, `.github/workflows/**`, `.spec-finder/config.json` (unrelated dirty preserved). No Pages workflow, no analytics pixels, no macOS/Linux installer buttons.

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Download on EN and PT with default href = `fallbackDownload` | satisfied | Built `site/dist/en/index.html` and `site/dist/pt/index.html`: `<a class="download-action" id="download-link" href="https://github.com/MatheusBBarni/idle-manager/releases/latest">` with labels “Download for Windows” / “Baixar para Windows”. |
| 2. Unauthenticated GET of TechSpec `api`, then set href from `selectWindowsDownload` | satisfied | Inlined module script fetches `https://api.github.com/repos/MatheusBBarni/idle-manager/releases/latest` with `{headers:{Accept:"application/vnd.github+json"}}` and assigns `link.href` from `selectWindowsDownload`. No `Authorization` header. |
| 3. Unsigned / unknown-publisher / SmartScreen warning with the control | satisfied | EN: “unsigned or from an unknown publisher (Microsoft SmartScreen)”. PT: “não está assinado ou é de um editor desconhecido (Microsoft SmartScreen)”. Both sit in `#download` next to the control. |
| 4. No GitHub tokens, analytics pixels, or macOS/Linux installer buttons | satisfied | Built EN/PT `<head>` is charset, viewport, description, title, favicon, one same-origin stylesheet. Tracker grep (gtag, googletagmanager, facebook.net, hotjar, plausible): none. No macOS/Linux installer controls. Source link remains GitHub. |
| 5. Must not retry in a loop on 429 | satisfied | Probe performs a single `fetch`. No `setInterval`, no retry loop in `probeWindowsDownload.ts` or inlined script. 429 maps to fallback via existing picker (`ok: false`). |
| 6. Keyboard-activatable Download | satisfied | Control is a real `<a>`; header nav includes `#download`; existing `:focus-visible` outline plus `.download-action:focus-visible`. No browser session; evidence is built HTML. |
| 7. CSP `connect-src` allows `api.github.com` if CSP is added | not applicable | No Content-Security-Policy meta or header is present on the site. |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm --dir site test` | pass | Exit 0. Vitest v3.2.7 in `site/`: 1 file, 7 tests passed (`selectWindowsDownload` cases unchanged). Duration 192ms. |
| `pnpm --dir site build` | pass | Exit 0. Log: `output: "static"`, `├─ /en/index.html`, `├─ /pt/index.html`, `├─ /index.html`, `3 page(s) built`. |
| Built EN/PT Download + SmartScreen | pass | Both locale indexes include fallback href, Windows-only Download label, and SmartScreen wording. Probe script inlined as `<script type="module">`. |
| `pnpm test` | pass | Exit 0. Vitest v3.2.7 at repo root: 4 files, 19 tests passed (partition, i18n, layout, workspace). Duration 214ms. |
| Live API 404 (optional) | pass | `GET .../releases/latest` returned HTTP 404 `Not Found`. JS-disabled and 404 both keep the default fallback href; picker unit tests cover 404/429. |
| Keyboard / browser | documented limitation | No browser in this environment. Built HTML has `#download` nav `<a>` and a real Download link with visible focus style. |

## Risks and Follow-ups

- Keyboard usability and live href swap were not exercised in a browser; HTML + unit tests + default href are the evidence.
- Empty Releases still open GitHub’s Releases page (ADR-004 G-03 relaxation).
- Pages workflow remains task_06; do not strip the inlined probe script on deploy.

## Final Verdict

completed — English and Portuguese landings always offer Download with href `https://github.com/MatheusBBarni/idle-manager/releases/latest`, a visible unsigned/SmartScreen warning, and a single unauthenticated Releases GET that applies `selectWindowsDownload`; picker tests and root `pnpm test` stay green.
