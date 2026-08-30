# Task Memory: task_02

## Objective Snapshot

Pure `selectWindowsDownload` with unit tests, no Electron, no browser fetch.

## Important Decisions

- Host allowlist follows TechSpec names (`github.com`, `githubusercontent.com`, `release-assets.githubusercontent.com`) and also accepts `*.githubusercontent.com` so ADR-004 `objects.githubusercontent.com` is allowed. TechSpec contract wins over prose; suffix match is the compatible reading.
- `ok: false` always falls back (covers 404 and 429). Assets are scanned only when `ok` and `json.assets` is an array.
- First asset that is both `.exe` (case-insensitive) and allowlisted https wins; a javascript: `.exe` is skipped, not treated as the only candidate when a later allowlisted `.exe` exists.
- Nested `site/` Vitest (`pnpm --dir site test`) rather than expanding root `vitest.config.ts` include.
- Context7 MCP was not available in this worker tool allowlist; Vitest 3.2 was pinned to match the Electron root.

## Learnings

- `site/package.json` already existed from task_01; `test` was merged and `vitest` added as a site devDependency (`3.2.7`).
- Root `pnpm test` still runs only `src/shared/**/*.test.ts` (19 tests).

## Files / Surfaces

- `site/src/lib/selectWindowsDownload.ts`
- `site/src/lib/selectWindowsDownload.test.ts`
- `site/vitest.config.ts`
- `site/package.json` (test script + vitest)
- `site/pnpm-lock.yaml`

## Errors / Corrections

## Ready for Next Run

task_05 should import this module for the browser probe; do not change picker rules there.
