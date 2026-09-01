# Task 03 Final Report: Show Apply/Later on the chrome strip

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` (Pi)

## Changes

- `src/renderer/src/store.ts` — `updateStatus` / `setUpdateStatus` (not on snapshot)
- `src/renderer/src/App.tsx` — `onUpdate` subscribe + unsubscribe
- `src/renderer/src/components/StatusBar.tsx` — getting copy; ready Apply/Later; idle/later version-only
- `src/shared/i18n.ts` — `updateGetting` / `updateApply` / `updateLater` EN+PT
- `src/shared/i18n.test.ts` — key coverage for those strings

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Subscribe to `onUpdate` (mirror `onMetrics`) and unsubscribe | satisfied | `App.tsx` `offUpdate()` |
| 2. Render getting / Apply+Later / version-only; later+idle look like today’s footer | satisfied | StatusBar branches on `phase` |
| 3. Later/Apply call `updateCommand`; do not set `overlayOpen` | satisfied | `sendUpdateCommand`; no overlay/dialog usage |
| 4. PT and EN strings; `i18n.test.ts` aligned | satisfied | keys + new test + MESSAGE_KEYS bijection |
| 5. Keep footer `h-8` usable | satisfied | compact `h-6` buttons; footer still `h-8` |
| 6. Do not start electron-updater or edit `release.yml` | satisfied | those files untouched |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test src/shared/i18n.test.ts src/shared/updateStatus.test.ts` | pass | Vitest 2 files / 14 tests, exit 0 |
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| G-04 overlay | pass (source) | StatusBar has no `overlayOpen` / `setDialog`; Stage.tsx not edited |
| Launched UI | not run | No renderer Vitest; dogfood remains |

## Risks and Follow-ups

- Apply/Later invoke has no main handler until task_04; rejections are swallowed so the footer does not throw.
- Until main emits `onUpdate`, chrome stays version-only (idle).
- Footer density with metrics + Apply/Later is unproven in a live window.

## Final Verdict

task_03 is completed: chrome maps `onUpdate` to a non-covering footer (getting copy, Apply/Later on ready, version-only otherwise), EN+PT keys are tested, and focused Vitest plus typecheck passed. Packaged apply still depends on task_04/task_05.
