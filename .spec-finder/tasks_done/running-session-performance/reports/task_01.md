# Task 01 Final Report: Show whole-app cost in chrome

## Outcome

- Verdict: completed
- Date: 2026-09-01
- Provider/session: pi / manual sf-batch-tasks

## Changes

- `src/shared/types.ts` — `AggregateMetrics` adds nullable `gpuCpu` / `gpuMemoryBytes`; `fps` is `number | null`
- `src/shared/metricsAggregate.ts` — pure all-process summarizer (GPU null vs present)
- `src/shared/metricsAggregate.test.ts` — GPU-present totals and GPU-absent nulls
- `src/main/metrics.ts` — `collectMetrics` uses the summarizer; per-account stats stay pid-based; `fps` always `null`; `ops:fps` argument ignored
- `src/renderer/src/components/Shell.tsx` — chrome rAF FPS loop removed
- `src/renderer/src/components/StatusBar.tsx` — whole-app CPU/RAM; GPU line only when both GPU fields are non-null; no FPS number
- `src/shared/i18n.ts` — `gpu` / `gpuUnknown` in `en`, `pt`, `es`, `zh-Hans`
- `src/shared/i18n.test.ts` — frozen keys and shared `gpu` acronym

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. `AggregateMetrics` / `MetricsPayload` (`gpu*` nullable; `fps: number \| null`; all-process totals) | satisfied | `src/shared/types.ts`; `summarizeAppMetrics` sums every row |
| 2. Pure summarizer in `src/shared` with GPU-null vs GPU-present tests | satisfied | `src/shared/metricsAggregate.ts`; `metricsAggregate.test.ts` (2 tests passed) |
| 3. Stop chrome rAF FPS; do not display fabricated FPS when `fps` is null | satisfied | `Shell.tsx` rAF loop deleted; StatusBar no longer reads store/`aggregate.fps` |
| 4. i18n GPU / omitted GPU in four locales | satisfied | `gpu`, `gpuUnknown` in all four dictionaries; `i18n.test.ts` complete-dictionary test passed |
| 5. MUST NOT edit `src/main/views.ts` paint policy or Chromium switches | satisfied | `git diff` has no `views.ts` or command-line switch changes |
| 6. SHOULD leave `ops:fps` handler inert | satisfied | `index.ts` still listens; `collectMetrics(..., _fps)` ignores it; aggregate `fps: null` |
| 7. SHOULD keep per-account `AccountMetrics` as renderer pid stats | satisfied | `metrics.ts` still maps `webContents.getOSProcessId()` to `perAccount` |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | passed | Vitest 8 files / 86 tests, including new `metricsAggregate.test.ts` (2) and `i18n.test.ts` (10) |
| `pnpm typecheck` | passed | `TypeScript: No errors found` |
| GPU-present summarizer | passed | GPU row 2.25 CPU / 4000 KiB copied; totals include Browser+Tab+GPU |
| GPU-absent summarizer | passed | `gpuCpu` / `gpuMemoryBytes` are `null`, not `0` |
| Status FPS | passed (review) | No rAF sender; StatusBar has no FPS span; `collectMetrics` sets `fps: null` |
| Windows G-03 vs Task Manager | not required this slice | Documented limitation; dogfood after ship |

## Risks and Follow-ups

- `gpuUnknown` is defined but unused in chrome because the GPU line is omitted when fields are null (TechSpec Failure). Harmless extra copy.
- Renderer store still has unused `fps` / `setFps`; left in place to avoid extra store churn.
- G-03 chrome vs Task Manager is operator dogfood, not this gate.
- task_02 must not restore FPS or cover the stage.

## Final Verdict

task_01 completed: status cost is whole-app RAM/CPU with nullable GPU, chrome rAF FPS is gone, and shared tests plus typecheck passed without touching paint policy.
