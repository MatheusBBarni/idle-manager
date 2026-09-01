# Task Memory: task_01

## Objective Snapshot

Show whole-app cost in chrome (US-05). Implemented.

## Important Decisions

- Aggregate totals come from every `getAppMetrics()` row via `summarizeAppMetrics`; per-account stats stay renderer-pid based.
- GPU fields are `null` when no `type === 'GPU'` row exists, never a stand-in `0`. Status omits the GPU line in that case (TechSpec Failure: omit GPU line). `gpuUnknown` exists for copy but is not shown, so chrome does not print `0 B` / `0.0%`.
- `fps` is always `null` from `collectMetrics`. Chrome rAF loop removed. Status does not render an FPS number. `ops:fps` in `index.ts` is left inert (ignored `_fps` argument).
- `gpu` is treated as a shared i18n acronym like CPU/RAM.

## Learnings

- `workingSetSize` is kilobytes; summarizer multiplies by 1024 to match existing byte display.
- Vitest cannot render StatusBar; FPS-null evidence is the removed rAF sender plus StatusBar no longer reading `fps`.

## Files / Surfaces

- `src/shared/types.ts` — `AggregateMetrics` gpu nullables + `fps: number | null`
- `src/shared/metricsAggregate.ts` / `metricsAggregate.test.ts` — pure summarizer
- `src/main/metrics.ts` — uses summarizer; per-account pid stats unchanged
- `src/renderer/src/components/Shell.tsx` — rAF FPS loop removed
- `src/renderer/src/components/StatusBar.tsx` — whole-app CPU/RAM; GPU only when both gpu fields non-null
- `src/shared/i18n.ts` / `i18n.test.ts` — `gpu`, `gpuUnknown` in en/pt/es/zh-Hans
- `src/main/views.ts` — not edited

## Errors / Corrections

## Ready for Next Run

Done. task_02 should add the 7th-start warning to StatusBar/Sidebar without a modal. Do not restore rAF FPS.
