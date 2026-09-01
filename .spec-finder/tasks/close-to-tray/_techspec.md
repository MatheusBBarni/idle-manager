# Close-to-tray — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/close-to-tray/_prd.md`
- Seam: `src/main/index.ts` last-window path **destroys** `WebContentsView`s (`syncViews` no-ops without chrome). Product Close-with-running must **keep that chrome instance**. Selected design: **win32 hide-in-place + skipTaskbar + Tray tooltip** ([ADR-002](adrs/adr-002.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | `syncViews` returns if chrome is gone; views parented to one window | `src/main/views.ts` | 2026-09-01 | Hide, do not destroy, while running |
| Repository | `WindowCommand` is min/max/close; no Quit; no Tray; no instance lock | `ipc.ts`, `index.ts` | 2026-09-01 | Extend command; add lock; tray in main |
| Repository | Vitest = `src/shared/**/*.test.ts`; i18n four locales | `vitest.config.ts`, `i18n.ts` | 2026-09-01 | Policy in shared; Electron in dogfood |
| Repository | Packaged win32 `quitAndInstall` after persist | `updater.ts` | 2026-09-01 | Same allow-close flag as Quit |
| Official docs | `close` `preventDefault` + `hide` + `setSkipTaskbar`; Tray tooltip/menu; no Win badge | Electron 37.10.3 Tray / BrowserWindow | 37.10.3 | Tooltip is the count; skipTaskbar for F-01 |
| Official docs | `quitAndInstall` emits window `close` **before** `before-quit` | [app.md](https://www.electronjs.org/docs/latest/api/app) | 37.10.3 | Set quitting **before** Apply |
| User decision | Hide+tooltip; `quit` command; app-wide lock; fail-closed; win32 only | TechSpec clarification + A | 2026-09-01 | Locks ADR-002 |
| Inference | Two processes on `persist:` jars while tray-hidden is worse than today’s double-launch | No lock today + F-07 | 2026-09-01 | Lock is a security boundary, not a feature |

## Technical Goals and Non-Goals

### Goals

- Intercept win32 chrome Close when running accounts exist **and** Tray constructed: hide, skip taskbar, keep views — G-01, G-02, F-01, US-01
- Empty Close / Quit / Apply update actually exit — G-04, F-02, F-05, US-02, US-04
- Tray only while dismissed live farm: tooltip count, Restore, Quit — G-03, F-04, F-03, US-03, US-05
- Minimize path unchanged — F-06, US-06
- `requestSingleInstanceLock`; second launch restores/focuses — F-07, Constraints
- Shared policy unit tests + i18n keys; isolation/partitions untouched — Constraints

### Non-Goals

- Destroy/recreate chrome or a hidden view host — `syncViews` single parent
- Drawn tray glyph, balloons, tray account commands, start-hidden
- Snapshot/`WorkspaceAction` for dismissed; persist tray state
- Close-to-tray on darwin/linux (current close/quit remains)
- New packages, e2e Electron harness, GUID tray (unsigned)
- Changing pop-out windows (PRD open question)

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | win32 Close + running + trayReady → hide + skipTaskbar | `shouldDismissToTray`, main close | unit policy + dogfood | CI cannot prove hide |
| G-02 | Do not destroy views on dismiss; throttling stays off | main hide vs `destroyAllViews` | dogfood ticks | — |
| G-03 | Tooltip `${n} {runningCount}` while dismissed | Tray `setToolTip` | unit string + dogfood | overflow hover |
| G-04 | Restore show; `quit` exits; empty Close quits | tray menu, `beginQuit` | unit + dogfood | — |
| US-01 | Close live farm → not on desktop/taskbar, still running | close interceptor | dogfood | — |
| US-02 | runningCount=0 → Close not intercepted | policy `runningCount>0` | unit | — |
| US-03 | Tray Restore → show, skipTaskbar false, tray gone | `restoreMainWindow` | dogfood | — |
| US-04 | Tray Quit + Settings `windowControl('quit')` | `WindowCommand` `'quit'` | typecheck + dogfood | — |
| US-05 | Tooltip shows N | `trayTooltip` | unit | — |
| US-06 | `'min'` still `minimize()` | `ops:window` | review + dogfood | — |
| US-07 | No partition/session change | views/partition untouched | `verify:isolation` if those files change; else review | — |
| F-01–F-07 | As rows above | — | — | — |
| Constraints | win32 gate; tray = status+restore+quit; Settings Quit; no telemetry/bots | ADR-002 | review | — |

## Decision

**Hide-in-place on win32** (ADR-002): keep the existing `BrowserWindow` and its `WebContentsView`s. Close is intercepted only when `shouldDismissToTray` is true. Count is a tooltip. **Trade-off:** no numeric icon glyph; hover/overflow for G-03. Gives up rehosting views and all-OS tray.

### Alternatives rejected

- Drawn icon count — user B rejected
- Destroy chrome / hidden host — user C rejected; G-02 risk

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `src/shared/trayPolicy.ts` | new | `runningAccountCount`, `shouldDismissToTray`, `trayTooltip` | snapshot/policy in, boolean/string out | `i18n`, types |
| `src/main/appSession.ts` | new | quitting flag, Tray lifecycle, hide/show/skipTaskbar, restore, `requestQuit` | close events, snapshot | Electron Tray, policy |
| `src/main/index.ts` | existing | wire close, IPC `'quit'`, single-instance, call session | — | appSession, updater |
| `src/main/updater.ts` | existing | Apply calls allow-close then `quitAndInstall` | — | appSession |
| `ipc.ts` + preload | existing | `WindowCommand` += `'quit'` | chrome | — |
| `Settings.tsx` + `i18n.ts` | existing | Quit control; keys `quit`, `trayRestore` | — | `windowControl('quit')` |

```text
  Close/Alt+F4/windowControl('close')
           |
           v
  shouldDismissToTray(win32, !quitting, trayReady, n>0)
      | yes                         | no
      v                             v
  hide + skipTaskbar            real close
  + Tray tooltip/menu           (empty Close / Quit / Apply)
      |
      +-- Restore / second-instance --> show, skipTaskbar false, tray.destroy
      +-- Quit / Apply --> beginQuit --> close allowed --> destroyAllViews as today
```

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `index.ts` close / window-all-closed | Must not destroy views on hide | Accidental `destroyAllViews` | Intercept before close completes |
| `updater.ts` Apply | `close` before `before-quit` | Apply stuck or farm-killed | `beginQuit` then install |
| `views.ts` | Unchanged if chrome lives | Hidden parent still required | Do not null `chromeWindow` on hide |
| `ipc.ts` / preload / `index.d.ts` | `'quit'` | Chrome on old command | Union + handler |
| `i18n.test.ts` | New keys | Frozen dict drift | Add quit/trayRestore |
| Pop-out `BrowserWindow`s | Unchanged | Extra windows stay | Out of scope |

## Contracts

### Public interfaces

```ts
export type WindowCommand = 'min' | 'max' | 'close' | 'isMaximized' | 'quit'

export function runningAccountCount(snapshot: WorkspaceSnapshot): number

export function shouldDismissToTray(input: {
  platform: string
  isQuitting: boolean
  trayReady: boolean
  runningCount: number
}): boolean
// true iff platform === 'win32' && !isQuitting && trayReady && runningCount > 0

export function trayTooltip(locale: Locale, runningCount: number): string
// `${runningCount} ${t(locale, 'runningCount')}`

// main, not on OpsourceAPI:
export function beginQuit(): void        // isQuitting=true; app.quit()
export function restoreMainWindow(): void
export function noteTrayReady(ok: boolean): void
```

`ops:window`:
- `'quit'` → `beginQuit()` (ignore missing window).
- `'close'` → `mainWindow.close()` (interceptor decides).
- `'min'` / `'max'` / `'isMaximized'` unchanged.

Tray menu (win32, dismissed only): `trayRestore` → `restoreMainWindow`; `quit` → `beginQuit`. Click tray → restore. No other items.

i18n (all four dicts + `i18n.test.ts`): `quit`, `trayRestore`. Tooltip reuses `runningCount`.

### Data model

No snapshot fields. Dismissed = `!mainWindow.isVisible()` + tray alive, in-memory. Relaunch shows the window.

### Errors

| Name | Behavior |
|---|---|
| `TrayConstructFailed` | `trayReady=false`; Close not intercepted (fail closed) |
| `QuitWhileDismissed` | `beginQuit` allows close; existing `window-all-closed` destroys views and quits |

### Changed boundaries

| Boundary | Current | Change | Failure | Compatibility |
|---|---|---|---|---|
| `WindowCommand` | no quit | add `'quit'` | unknown command ignored as today | additive |
| Process instances | many | single lock | second process exits | first launch wins; restore if dismissed |
| win32 Close + running | quit + destroy views | hide if tray ready | no tray → old quit | darwin/linux unchanged |

## Failure and Edge Cases

| Failure mode | Detection | Behavior | Recovery | Evidence |
|---|---|---|---|---|
| Tray cannot be created | constructor throw / null | `trayReady=false`; Close quits | none; fail closed | unit `trayReady=false` |
| Apply update while dismissed/visible | Apply clicked | `beginQuit` then `quitAndInstall` | install relaunch | review + dogfood |
| Second instance | `second-instance` | restore/focus first; second exits | — | dogfood |
| runningCount → 0 while dismissed | snapshot after commit | restore window, destroy tray (empty chrome, not a ghost tray) | operator Closes to quit | unit+review |
| Windows shutdown | OS kill; no `before-quit` | process dies | OS | docs; accept |
| Pop-out open | pop window exists | main hides; pop-out unchanged | PRD non-blocking | — |

## Security, NFRs, and Operations

### Security and privacy

- Single-instance so two processes do not open the same `persist:opsource-account-*` stores.
- Tray cannot start/stop/navigate accounts. Game views stay sandboxed, no preload.
- Fail closed rather than hide with no restore handle.

### Compatibility, rollout, and rollback

- win32 only. Remove interceptor + lock to roll back. Additive IPC. No migration.

### Observability

- No telemetry. Optional `console.error` on tray construct failure (same as persist/updater).

## Tests

- **Unit:** `shouldDismissToTray` matrix: win32+running+tray+!quit → true; else false (non-win32, n=0, quitting, !trayReady). `runningAccountCount` only `status==='running'`. `trayTooltip` uses locale `runningCount`. i18n keys present in four dicts (`i18n.test.ts`).
- **Integration:** none new in Vitest (no Electron).
- **Platform / e2e:** Windows dogfood journal (PRD G-01–G-04): Close hide, tooltip N, restore, Settings/tray Quit, empty Close, Minimize, Apply update, second-instance restore, ticks while hidden.
- **Gates:** `pnpm test`; `pnpm typecheck`. `pnpm verify:isolation` only if partition/session/views isolation paths change (this design must not).

## Sequencing

1. `trayPolicy.ts` + tests + i18n keys — no dependencies.
2. `WindowCommand` `'quit'` + preload types — independent of tray UI; Settings can wire after this.
3. `appSession` hide/tray/restore/`beginQuit` + index close hook + updater allow-close — depends on 1–2 because policy and `'quit'` must exist.
4. Settings Quit + tray menu labels — depends on 2–3.
5. `requestSingleInstanceLock` + `second-instance` → `restoreMainWindow` — depends on 3 because restore must exist.
6. Windows dogfood — depends on 3–5.

## Open Questions

- Non-blocking: pop-out visibility when main is hidden (PRD). V1 does not hide or tray pop-outs.
- Non-blocking: darwin/linux Close matching after Windows G-01.

## Architecture Decision Records

- [ADR-001: Dismissed-farm presence](adrs/adr-001.md) — product Close/Quit rule
- [ADR-002: Hide-in-place tray session](adrs/adr-002.md) — this design
