# Task 02 Final Report: Select a Windows Download href from GitHub Releases JSON

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` worker (not ACP runtime)

## Changes

- `site/src/lib/selectWindowsDownload.ts` — Pure picker: first allowlisted `.exe` or fallback href. No Electron, no fetch, no DOM.
- `site/src/lib/selectWindowsDownload.test.ts` — Unit cases: 404, empty assets, 429, first `.exe`, `.dmg` skip, `javascript:` reject, skip-rejected-then-next-allowlisted.
- `site/vitest.config.ts` — Site Vitest, `environment: 'node'`, `include: ['src/**/*.test.ts']`.
- `site/package.json` — Merged `test: vitest run`; added `vitest` `^3.2.7` as a site devDependency. Astro scripts preserved.
- `site/pnpm-lock.yaml` — Lockfile for site vitest.
- `memory/MEMORY.md`, `memory/task_02.md` — Picker path, allowlist reading, `pnpm --dir site test`.

Not changed: `src/main/**`, `src/renderer/**`, `vitest.config.ts` (root include still `src/shared/**/*.test.ts`), root `package.json` scripts, `site/src/pages/**`, `site/src/layouts/**`, `.spec-finder/config.json` (unrelated dirty preserved).

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Implement `selectWindowsDownload` with TechSpec signature and rules | satisfied | `export type ProbeResult` and `selectWindowsDownload(input: { ok, status, json }, fallbackHref)` in `site/src/lib/selectWindowsDownload.ts`. Returns `{ kind: 'asset', href, name }` or `{ kind: 'fallback', href }`. |
| 2. First case-insensitive `.exe` with allowlisted host; else fallback | satisfied | Two-`.exe` fixture returns the first github.com asset. `.dmg`-only fixture returns fallback. Hosts: `github.com`, `githubusercontent.com`, `*.githubusercontent.com`. |
| 3. Reject non-`https` or off-allowlist URLs as fallback (`AssetRejected`) | satisfied | `javascript:alert(1)` `.exe` → fallback. Protocol must be `https:`; host must match the allowlist. |
| 4. Unit-test 404/empty/429, first `.exe`, `.dmg`, `javascript:` | satisfied | `pnpm --dir site test`: 7 tests passed, including the six required cases. |
| 5. Add `pnpm --dir site test` without altering root Vitest include; merge scripts | satisfied | `site/package.json` `test` script merged. Root `vitest.config.ts` unchanged (`src/shared/**/*.test.ts`). Root `pnpm test`: 4 files, 19 tests. |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm --dir site test` | pass | Exit 0. Vitest v3.2.7 in `site/`: 1 file, 7 tests passed. Duration 187ms. |
| `pnpm test` | pass | Exit 0. Vitest v3.2.7 at repo root: 4 files, 19 tests passed (partition, i18n, layout, workspace). Duration 214ms. |
| Root Vitest include | pass | `vitest.config.ts` still `include: ['src/shared/**/*.test.ts']`. Site tests not collected by root run. |
| Coverage ≥ 80% | not measured | No coverage provider installed in `site/`. All TechSpec unit cases plus skip-rejected-then-next are asserted. |

## Risks and Follow-ups

- Browser fetch and Download `<a>` remain task_05; this slice is library-only.
- Coverage percentage is not measured (no `@vitest/coverage-v8` in `site/`).
- Context7 MCP was unavailable in this worker; Vitest version matches the Electron root (3.2.x).

## Final Verdict

completed — `selectWindowsDownload` maps GitHub Releases JSON to an allowlisted `.exe` href or the fallback Releases URL, `pnpm --dir site test` is green on the TechSpec cases, and root `pnpm test` still only runs `src/shared/**/*.test.ts`.
