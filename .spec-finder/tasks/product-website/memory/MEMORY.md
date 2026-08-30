# Workflow Memory

## Current State

- Packet `product-website` task_01–task_03 implemented in `site/`; task_04–task_06 still pending.

## Shared Decisions

- Graph: 01 EN landing, 02 picker (parallelizable with 01), 03 PT locales, 04 privacy+LICENSE+source, 05 Download probe, 06 Pages Action.
- G-03 hide-button relaxed by ADR-004 (always-on Download, fallback to GitHub Releases).
- `site/` is a nested pnpm workspace (own `pnpm-workspace.yaml` + lockfile), not a member of the Electron root workspace, so `pnpm --dir site` stays isolated.
- Picker allowlist: `https:` on `github.com`, `githubusercontent.com`, or `*.githubusercontent.com` (covers ADR-004 `objects.githubusercontent.com` and TechSpec `release-assets.githubusercontent.com`).
- Astro i18n: `defaultLocale: 'en'`, `locales: ['en','pt']`, `prefixDefaultLocale: true`. Root `/idle-manager/` → `/idle-manager/en/` via `src/pages/index.astro` `Astro.redirect(getRelativeLocaleUrl('en'))` (`redirectToDefaultLocale: false` to avoid dual-owner `/` warning). Locale switch is `getRelativeLocaleUrl` `<a>` links.

## Shared Learnings

- English route is file-based `site/src/pages/en/index.astro` with `site: https://matheusbarni.github.io` and `base: '/idle-manager'`.
- Portuguese route is `site/src/pages/pt/index.astro` using the same `Landing.astro` shell.
- `site/src/layouts/Landing.astro` is the shared shell. Merge `site/package.json` scripts; do not recreate the package.
- `selectWindowsDownload` is `site/src/lib/selectWindowsDownload.ts`. Site tests: `pnpm --dir site test` (Vitest 3.2 in `site/`, include `src/**/*.test.ts`). Root `pnpm test` remains `src/shared/**/*.test.ts` only.

## Open Risks

- Enabling GitHub Pages in repo Settings is outside git (task_06 rollout).
- Keyboard pass was HTML-inspected only (no browser in this run).

## Handoffs

- task_04: privacy copy, MIT LICENSE, GitHub source on both locales; no extra pixels.
- task_05: import `selectWindowsDownload`; do not change picker rules; wire browser GET there.
