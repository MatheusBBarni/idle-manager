# Task Memory: task_01

## Objective Snapshot

Ship English isolation landing via new `site/` Astro static app.

## Important Decisions

- ADR-003 i18n (`prefixDefaultLocale`, `/pt/`, `/` → `/en/`) deferred to task_03. This slice uses file-based `src/pages/en/index.astro` only so English lands at `/idle-manager/en/` without a root redirect or PT route.
- Nested pnpm workspace at `site/` (`site/pnpm-workspace.yaml` + `site/pnpm-lock.yaml`) so `pnpm --dir site` does not attach to the Electron root workspace. Root `package.json` scripts and lockfile left unchanged.
- Context7 MCP tools were not available in this worker; Astro `site` + `base` taken from current GitHub Pages docs (`https://docs.astro.build/en/guides/deploy/github/`).
- Keyboard evidence is built HTML (skip link, in-page `#isolation` / `#not-a-bot`, `:focus-visible`); no browser session was available.

## Learnings

- Root `pnpm --dir site install` without a site workspace file no-ops against the Electron workspace. Site needs its own `pnpm-workspace.yaml` (and `onlyBuiltDependencies: ["esbuild"]`) for Astro’s esbuild postinstall under pnpm v11.

## Files / Surfaces

- `site/package.json`, `site/astro.config.mjs`, `site/tsconfig.json`, `site/pnpm-workspace.yaml`, `site/pnpm-lock.yaml`, `site/.gitignore`
- `site/src/layouts/Landing.astro`, `site/src/pages/en/index.astro`, `site/public/icon.png`
- Untouched: `src/main`, `src/renderer`, `vitest.config.ts`, root `package.json`

## Errors / Corrections

- First `pnpm --dir site install` did nothing (parent workspace). Nested workspace + esbuild allowlist fixed install.

## Ready for Next Run

- Layout is the shared shell for PT. Do not add `src/pages/index.astro` here. No `test` script yet (task_02).
