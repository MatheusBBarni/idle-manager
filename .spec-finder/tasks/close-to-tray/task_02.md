---
status: pending
title: Dismiss a live farm to the tray
type: backend
complexity: high
dependencies:
  - task_01
---

# Task 02: Dismiss a live farm to the tray

## Overview

On Windows, Close must put a running farm out of the way without stopping ticks, and the operator must see a count and get the window back. Primary **US-01** (also US-02, US-03 tray path, US-05, F-01–F-04, G-01–G-03). This slice intercepts win32 Close when policy says dismiss, hides chrome, skipTaskbar, Tray tooltip + Restore/Quit, fail-closed if no Tray, and hooks Apply to `beginQuit`. It gives up second-instance lock (task_03) and does not change Minimize.

## Source Artifacts

- PRD: `.spec-finder/tasks/close-to-tray/_prd.md`
- TechSpec: `.spec-finder/tasks/close-to-tray/_techspec.md`

<critical>
- Read `.spec-finder/tasks/close-to-tray/_prd.md`, `.spec-finder/tasks/close-to-tray/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_02.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** 3–6 accounts running in the main window on win32 and Tray constructed
- **When** I Close the window
- **Then** the window is not on the desktop or taskbar, those accounts stay running, and the tray tooltip shows the running count
- **Given** no accounts are running
- **When** I Close the window
- **Then** the app exits and no tray icon remains
- **Given** a dismissed live farm
- **When** I Restore from the tray (click or `trayRestore` item)
- **Then** the window returns with those accounts still running, skipTaskbar is false, and the tray is gone
- **Given** a dismissed live farm
- **When** I Quit from the tray
- **Then** the app exits
- **Given** Tray cannot be constructed
- **When** I Close with running accounts
- **Then** Close is not intercepted (fail closed)
- **Given** a live farm in the main window
- **When** I Minimize
- **Then** a taskbar button remains and this is not Close-to-tray

## Out of Scope

- **Settings Quit and `WindowCommand` `'quit'`** — task_01 (already done)
- **`requestSingleInstanceLock`** — task_03
- **Drawn tray glyph, balloons, tray start/stop/mute** — PRD out of scope
- **darwin/linux Close-to-tray** — TechSpec non-goal; keep current close/quit
- **Pop-out hide/tray rules** — PRD open question; do not change pop-outs
- **Partition / `views.ts` isolation behavior** — do not null `chromeWindow` on hide; do not destroy views until real quit

<requirements>
1. MUST implement TechSpec Contracts `runningAccountCount`, `shouldDismissToTray`, and `trayTooltip` in `src/shared` and unit-test them next to the module.
2. MUST intercept chrome `close` only when `shouldDismissToTray` is true: hide, `setSkipTaskbar(true)`, keep the same `BrowserWindow` and views.
3. MUST fail closed: Tray construct failure ⇒ `trayReady=false` ⇒ Close quits as today.
4. MUST show Tray only while dismissed: tooltip from `trayTooltip`, menu Restore + Quit only, click restores; destroy tray on restore.
5. MUST call `beginQuit` before `quitAndInstall` on Apply (TechSpec Failure: close fires before `before-quit`).
6. MUST restore the window (show, skipTaskbar false, destroy tray) if `runningCount` becomes 0 while dismissed.
7. MUST NOT change `'min'` / `'max'`, partitions, or `workspace.ts`.
8. SHOULD refresh tooltip when running count changes while dismissed.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, G-01 | Live Close dismisses; ticks continue | interceptor + dogfood |
| US-02, F-02 | Empty Close not dismissed | policy tests |
| US-03, F-04 | Tray restore | restore helper |
| US-05, F-03, G-03 | Tooltip count | `trayTooltip` tests |
| US-06, F-06 | Minimize unchanged | review `'min'` |
| US-07, F-07 | No isolation change | do not edit partition/views isolation |
| G-02 | No destroy-on-hide | hide vs `destroyAllViews` |
| TechSpec Sequencing 1, 3–4 | Policy then session then tray labels | this task |
| ADR-002 | Hide-in-place; win32 only; fail closed | policy + session |

## Subtasks

- [ ] 02.1 Add shared dismiss policy + tooltip tests (win32/running/tray/!quit vs all false paths).
- [ ] 02.2 On win32 Close, hide + skipTaskbar + Tray when policy is true; fail closed otherwise.
- [ ] 02.3 Restore and tray Quit; destroy tray when shown; handle runningCount → 0 while dismissed.
- [ ] 02.4 Hook Apply so install uses `beginQuit` then `quitAndInstall`.
- [ ] 02.5 Run shared tests and typecheck; record Windows dogfood or host limitation.

## Implementation Details

Use TechSpec Contracts (`shouldDismissToTray`, `trayTooltip`, `restoreMainWindow`, `noteTrayReady`), Architecture (`appSession.ts` tray lifecycle, close hook, updater), Failure table, and Sequencing steps 1 and 3–4. Do not paste signatures or the ASCII flow.

Reuse task_01 `beginQuit`, `quit`, and `trayRestore` keys. Do not re-own ipc/preload.

### Relevant Files

- `src/shared/trayPolicy.ts` — create
- `src/shared/trayPolicy.test.ts` — create
- `src/main/appSession.ts` — extend with hide/tray/restore (exists after task_01)
- `src/main/index.ts` — `close` interceptor; do not add the instance lock
- `src/main/updater.ts` — Apply calls `beginQuit` then install

### Dependent Files

- `src/main/views.ts` — must keep `chromeWindow` set while hidden; do not edit unless a hide bug forces it, and then do not change partitions
- `src/renderer/src/components/Chrome.tsx` — Close still `windowControl('close')`
- `src/shared/i18n.ts` — consume `trayRestore` / `quit`; keys landed in task_01
- `resources/icon.ico` / existing `iconPath` — tray image; no new asset required unless construct fails without ICO

### Related ADRs

- [ADR-001: Dismissed-farm presence](adrs/adr-001.md) — Close with running → tray; empty Close quits
- [ADR-002: Hide-in-place tray session](adrs/adr-002.md) — hide not destroy; tooltip count; fail closed; win32 only

## Deliverables

- win32 live Close dismisses; empty Close quits; tray restore/quit; Apply not stuck
- Shared policy tests
- `pnpm test` and `pnpm typecheck` clean
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [ ] Given `platform: 'win32'`, `isQuitting: false`, `trayReady: true`, `runningCount: 3`, when `shouldDismissToTray`, then true.
- [ ] Given `platform: 'darwin'` or `'linux'`, same other flags, then false.
- [ ] Given `runningCount: 0` or `isQuitting: true` or `trayReady: false`, then false.
- [ ] Given a snapshot with mixed running/closed accounts, when `runningAccountCount`, then only `status === 'running'` is counted.
- [ ] Given locale `en` and count `4`, when `trayTooltip`, then the string includes `4` and the `runningCount` copy.

### Integration Tests

- [ ] Not applicable — Vitest cannot construct Electron Tray.

### Platform or Manual Evidence

- [ ] Windows dogfood when the host can run the packaged or `pnpm dev` app: live Close hides (no taskbar button), tooltip N, restore, tray Quit, empty Close, Minimize still taskbar, ticks while hidden, Apply still quits/installs. If not on win32 or Tray cannot be exercised, document the limitation and continue with `pnpm test` / `pnpm typecheck`.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

Do not run `pnpm verify:isolation` unless this slice actually changes partition/session/view isolation paths (it must not).

## Rollout

- win32-only Close behavior change. darwin/linux unchanged. No snapshot migration. Rollback = remove interceptor.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable (`trayPolicy` is the measurable part).
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks (including skipped Windows dogfood).
