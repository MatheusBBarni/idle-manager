# Workflow Memory

## Current State

- Packet `product-website` task_01 English landing implemented in `site/`; later tasks still pending.

## Shared Decisions

- Graph: 01 EN landing, 02 picker (parallelizable with 01), 03 PT locales, 04 privacy+LICENSE+source, 05 Download probe, 06 Pages Action.
- G-03 hide-button relaxed by ADR-004 (always-on Download, fallback to GitHub Releases).
- `site/` is a nested pnpm workspace (own `pnpm-workspace.yaml` + lockfile), not a member of the Electron root workspace, so `pnpm --dir site` stays isolated.

## Shared Learnings

- English route is file-based `site/src/pages/en/index.astro` with `site: https://matheusbarni.github.io` and `base: '/idle-manager'`. Astro i18n / root redirect wait for task_03.
- `site/src/layouts/Landing.astro` is the shared shell. Merge `site/package.json` scripts; do not recreate the package.

## Open Risks

- Enabling GitHub Pages in repo Settings is outside git (task_06 rollout).
- Keyboard pass was HTML-inspected only (no browser in this run).

## Handoffs

- task_02: add `selectWindowsDownload` + `pnpm --dir site test`; merge scripts into existing `site/package.json`.
- task_03: add `/pt/`, locale `<a>` links, `/` → `/en/` on this layout; prefix internal links with `base`.
