# Task 05 Final Report: Attach Windows latest.yml on GitHub Releases

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` (Pi)

## Changes

- `.github/workflows/release.yml` — Windows fail-closed uploads for `dist/latest.yml` and `dist/*.exe.blockmap`; GitHub Release attaches both next to installers
- `electron-builder.yml` — unchanged (task_02 pack change `none`)

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Keep `--publish never` and two-job release shape | satisfied | Package step still `--publish never`; `build` + `release` jobs remain |
| 2. Attach task_02 feed globs; fail if missing | satisfied | `feed-win-yml` / `feed-win-blockmap` `if-no-files-found: error`; release `fail_on_unmatched_files: true` |
| 3. Pack decision so `electron-updater` is inside asar | satisfied | pack `none`; runtime dep already added in task_04 |
| 4. Do not upload mac/linux updater metadata | satisfied | mac/linux still `*.dmg` / `*.AppImage` only |
| 5. Keep installer names for website download | satisfied | Windows installer glob still `*.exe` / `idle-manager-*-win-x64.exe` |
| 6. Do not set `verifyUpdateCodeSignature` false | satisfied | not set |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | pass | Vitest 6 files / 41 tests, exit 0 |
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| Windows pack `dist/` listing | not run | Darwin host; spike names used |
| Workflow diff | pass | Windows feed steps + release files; mac/linux artifacts unchanged |

## Risks and Follow-ups

- First tagged Windows CI run must list `dist/` and confirm both feed files. Missing blockmap fails the Windows job by design.
- Authenticode (ADR-001) still blocks a live in-app Apply.
- SHA256SUMS now hashes yml/blockmap as well as installers.

## Final Verdict

task_05 is completed: Windows releases attach `latest.yml` and `*.exe.blockmap` fail-closed, `--publish never` remains, packing needed no extra glob, and `pnpm test` plus `pnpm typecheck` passed. G-01 still needs a signed tag.
