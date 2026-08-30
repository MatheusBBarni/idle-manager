# Workflow Memory

## Current State

- Packet `product-website` task_01 English landing and task_02 picker are implemented in `site/`; task_03–task_06 still pending.

## Shared Decisions

- Graph: 01 EN landing, 02 picker (parallelizable with 01), 03 PT locales, 04 privacy+LICENSE+source, 05 Download probe, 06 Pages Action.
- G-03 hide-button relaxed by ADR-004 (always-on Download, fallback to GitHub Releases).
- `site/` is a nested pnpm workspace (own `pnpm-workspace.yaml` + lockfile), not a member of the Electron root workspace, so `pnpm --dir site` stays isolated.
- Picker allowlist: `https:` on `github.com`, `githubusercontent.com`, or `*.githubusercontent.com` (covers ADR-004 `objects.githubusercontent.com` and TechSpec `release-assets.githubusercontent.com`).

## Shared Learnings

- English route is file-based `site/src/pages/en/index.astro` with `site: https://matheusbarni.github.io` and `base: '/idle-manager'`. Astro i18n / root redirect wait for task_03.
- `site/src/layouts/Landing.astro` is the shared shell. Merge `site/package.json` scripts; do not recreate the package.
- `selectWindowsDownload` is `site/src/lib/selectWindowsDownload.ts`. Site tests: `pnpm --dir site test` (Vitest 3.2 in `site/`, include `src/**/*.test.ts`). Root `pnpm test` remains `src/shared/**/*.test.ts` only.

## Open Risks

- Enabling GitHub Pages in repo Settings is outside git (task_06 rollout).
- Keyboard pass was HTML-inspected only (no browser in this run).

## Handoffs

- task_03: add `/pt/`, locale `<a>` links, `/` → `/en/` on this layout; prefix internal links with `base`.
- task_05: import `selectWindowsDownload`; do not change picker rules; wire browser GET there.
