# Task Memory: task_05

## Objective Snapshot

- Attach Windows `latest.yml` (+ blockmap) on GitHub Releases; asar contains updater.

## Important Decisions

- Feed globs from task_02: `dist/latest.yml` and `dist/*.exe.blockmap`, each uploaded with `if-no-files-found: error`.
- Pack change `none`: `electron-builder.yml` untouched; `electron-updater` is already a runtime dependency.
- `--publish never` kept. mac/linux still upload dmg/AppImage only.
- Release `fail_on_unmatched_files: true` also requires `installers/latest.yml` and `installers/*.exe.blockmap`.

## Learnings

- Combined multiline upload-artifact can succeed if only one glob matches; split steps so each file is fail-closed.

## Files / Surfaces

- `.github/workflows/release.yml`

## Errors / Corrections

## Ready for Next Run

- Done. Live Apply still needs Authenticode (ADR-001) and a tagged Windows pack that actually emits those files.
