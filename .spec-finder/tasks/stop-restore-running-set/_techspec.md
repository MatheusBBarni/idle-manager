# Stop and restore last running set — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/stop-restore-running-set/_prd.md`
- Start all already loops `account/setStatus` in the sidebar. Bulk stop cannot: last-set would freeze as the last closed id. Selected design: three atomic `applyAction` verbs, `lastRunningAccountIds` on snapshot v1, three loop chords ([ADR-002](adrs/adr-002.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | Workspace mutations belong in `applyAction`; renderer is a mirror | `AGENTS.md`, `workspace.ts` | 2026-09-01 | No last-set logic in Sidebar/main |
| Repository | `commitAll` applies each action then one `syncViews` | `src/main/index.ts` | 2026-09-01 | One bulk action → one view sync |
| Repository | `parseSnapshot` requires `version === 1`; shortcuts already defaulted extra fields | `workspace.ts` | 2026-09-01 | No version bump; missing last-set → `[]` |
| Repository | Loop interceptor on chrome + game contents; chrome keys stay Shell | `accountLoop.ts`, `chromeShortcuts.ts` | 2026-08-31 | New verbs are `LOOP_COMMANDS` |
| Repository | Close sets `status: 'closed'` and `poppedOut: false`; wipe is `accountIdsToWipe` only | `workspace.ts` | 2026-09-01 | Stop reuses close, never wipe |
| Official docs | `preventDefault` on `before-input-event` blocks the page | [webContents](https://www.electronjs.org/docs/latest/api/web-contents) Electron 37.10.3 | 2026-08-31 | Match-only preventDefault (existing interceptor) |
| Official docs | `globalShortcut` is OS-global | [Electron keyboard](https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts) | 2026-08-31 | Do not use |
| User decision | Atomic actions; snapshot omit export; Mod+W / Mod+Shift+W / Mod+Shift+Enter; drop ids on delete; fold into `workspace.ts` | ADR-002 | 2026-09-01 | Locks this spec |

**Inference (labeled):** only the focused `webContents` emits `before-input-event` (same as shortcut packets). Guest-focus is dogfood, not CI.

## Technical Goals and Non-Goals

### Goals

- Atomic `account/stopTab`, `account/stopFarm`, `account/restoreLastSet` in `applyAction` — F-01, F-02, F-04, F-07
- `lastRunningAccountIds` before/after algebra on every status/membership change — F-03, US-03
- Persist on snapshot v1; omit export; clear on import; drop ids on delete; restore skips missing — F-03, F-07, US-03
- Three loop commands, remappable, Settings + README — F-06, G-04
- Start all remains the sidebar `account/setStatus` loop — F-05, G-05, US-05
- Stop/restore never enter `accountIdsToWipe`; isolation unchanged — F-08, G-03, US-06
- Unit tests in `workspace.test.ts` + `shortcuts.test.ts`; gates `pnpm test` + `pnpm typecheck` — G-01–G-05 evidence in CI that unit tests can prove

### Non-Goals

- New module, IPC, game preload, snapshot version bump, `globalShortcut`
- Keyboard Start all; replacing Start all with an atomic `account/startTab`
- Auto-start last-set on launch or empty-stage CTA
- Switching `activeTabId` on restore
- Site `/keyboard/` pages (PRD lists Settings + README only)
- Electron keyboard e2e; `verify:isolation` (no partition change)
- Logging `input.key`; usage telemetry

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | `stopTab` / `stopFarm` close that scope in one commit | `applyAction` | unit: two-tab fixture | Journal after ship |
| G-02 | Restore starts last-set only | `account/restoreLastSet` | unit | Journal after ship |
| G-03 | No wipe; jars unchanged | `accountIdsToWipe` empty for new actions | unit | Journal logins |
| G-04 | Loop chords while game focused | interceptor + `LOOP_COMMANDS` | unit match; dogfood guest-focus | Guest-focus not in CI |
| G-05 | Start all loop unchanged | `Sidebar.tsx` | review + no new start-all action | — |
| US-01 | Stop this tab; no-op if none running there | `account/stopTab` | unit | — |
| US-02 | Stop farm including pop-outs | `account/stopFarm` | unit poppedOut → closed | — |
| US-03 | Last-set freeze / hand-close shrink / skip deleted / empty restore | last-set helper | unit | — |
| US-04 | Three binds; unmatched keys pass | matcher + interceptor | unit null; dogfood typing | — |
| US-05 | Start all still every closed in tab | Sidebar loop | review | — |
| US-06 | Isolation / no clear-session | no wipe; existing partitions | `accountIdsToWipe` unit | isolation gate unchanged |
| F-01–F-08 | As rows above | same | same | — |
| Constraints | Mod-only loop; no global; overlay skip; four locales; Windows-primary same behavior | shortcuts + i18n + interceptor | unit + i18n test | Overlay skip already in interceptor |

## Decision

Fold last-set and three bulk verbs into `workspace.ts`. Snapshot field, no export, import `[]`. Loop catalog grows by three. Sidebar adds the trio next to Start all (expanded footer only; collapsed sidebar still has no Start all). **Trade-off:** `workspace.ts` grows; Start all stays a multi-commit loop.

### Alternatives rejected

- Renderer loop of `setStatus` for stop — last-set wrong (ADR-002)
- `farmSession.ts` — extra module
- Atomic Start all — not required by G-05

## Architecture

```
Sidebar / accountLoop
    → dispatch one WorkspaceAction
        → applyAction (statuses + lastRunningAccountIds)
            → commitAll → syncViews + broadcast + saveSnapshot
```

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `src/shared/types.ts` | existing | `lastRunningAccountIds: string[]` | snapshot | none |
| `src/shared/workspace.ts` | existing | actions, last-set algebra, parse/export/import | snapshot in/out | types |
| `src/shared/shortcuts.ts` | existing | three `LOOP_COMMANDS` + defaults | matcher | none |
| `src/main/accountLoop.ts` | existing | map commands → actions | Electron input | workspace actions |
| `src/renderer/src/components/Sidebar.tsx` | existing | trio + unchanged Start all | dispatch | workspace |
| `Settings.tsx` / `i18n.ts` / `README.md` | existing | labels + bind list | — | shortcuts catalog |

### Data flow

Normal: stop/restore action → reducer updates statuses and last-set → `syncViews` destroys or creates views (existing close/start).

No-op: `applyAction` returns the same snapshot reference; interceptor still only `preventDefault`s when it produced actions (existing rule). `actionsForCommand` returns `[]` when the live tab is missing for `stopTab`; it still returns `stopFarm` / `restoreLastSet` and the reducer no-ops if there is no work.

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `types.ts` / `workspace.ts` / `workspace.test.ts` | field + 3 actions | last-set wrong if `setStatus` skips the helper | wrap every status/membership path |
| `shortcuts.ts` / `shortcuts.test.ts` | catalog length | conflict with existing defaults | unit `shortcutConflict` |
| `accountLoop.ts` (shared + main) | command → action | empty actions leak Mod+W to the game | return action whenever a tab exists for stop-tab; reducer no-ops |
| `Sidebar.tsx` | three controls | footer crowding | expanded footer only |
| `Settings.tsx` / i18n ×4 / README | labels | locale drift | `i18n.test.ts` keys |
| `exportMetadata` / `snapshotFromImport` | omit / clear | import restoring a farm | unit |
| `accountIdsToWipe` | no change for new actions | accidental wipe | unit empty |

## Contracts

### Public interfaces

```ts
// WorkspaceSnapshot (version remains 1)
lastRunningAccountIds: string[]

type WorkspaceAction =
  | { type: 'account/stopTab'; tabId: string }
  | { type: 'account/stopFarm' }
  | { type: 'account/restoreLastSet' }
  | /* existing */

type ShortcutCommand =
  | 'account-stop-tab'
  | 'account-stop-farm'
  | 'account-restore-last'
  | /* existing */

LOOP_COMMANDS includes the three new commands.

SHORTCUT_DEFAULTS:
  'account-stop-tab':     { key: 'w', shift: false, alt: false }      // Mod+W
  'account-stop-farm':    { key: 'w', shift: true,  alt: false }      // Mod+Shift+W
  'account-restore-last': { key: 'Enter', shift: true, alt: false }   // Mod+Shift+Enter
```

`accountLoop` `actionsForCommand`:

- `account-stop-tab` → `[{ type: 'account/stopTab', tabId }]` when `liveTab()` exists, else `[]`
- `account-stop-farm` → `[{ type: 'account/stopFarm' }]`
- `account-restore-last` → `[{ type: 'account/restoreLastSet' }]`

### Data model

Last-set algebra after any action that can change running membership (`account/setStatus`, the three new actions, `account/delete`, `tab/delete`):

1. `beforeIds` = running account ids before the action.
2. Apply the action (close uses `status: 'closed', poppedOut: false`; restore sets `status: 'running'` on closed members; ignore unknown ids).
3. `afterIds` = running account ids after.
4. If `afterIds.length > 0`, last-set = `afterIds` (stable order: `Object.values` scan is not required; use sorted-by-first-seen in `beforeIds` then any new ids, or tab `accountOrder` flattened — **implementation: unique ids in farm-wide `accountOrder` concatenation of `snapshot.tabs` then leftover ids**).
5. Else if `beforeIds.length > 0`, last-set = `beforeIds` (farm just emptied).
6. Else keep previous last-set.
7. Filter last-set to ids that still exist in `accounts`.

Parse: if `raw.lastRunningAccountIds` is not an array, `[]`. Keep only non-empty strings; drop duplicates (first wins); drop ids not in `accounts` on load.

`emptySnapshot`: `[]`. `exportMetadata`: omit the field. `snapshotFromImport`: `[]`.

Identity: unknown `tabId`, no running in that tab, farm already empty, or restore with no existing closed last-set members → return the input snapshot reference.

### Errors

No thrown errors. Unknown ids skipped. No user-facing error string for empty restore (F-07).

### Changed boundaries

| Boundary | Current contract | Change | Failure behavior | Compatibility/migration |
|---|---|---|---|---|
| `WorkspaceSnapshot` | no last-set | add `lastRunningAccountIds` | missing → `[]` | old files load; older builds ignore extra JSON key if they re-save via parse… older builds don’t write the key; new builds default |
| `WorkspaceAction` | no bulk verbs | three new types | unknown types ignored by current switch (fall through must stay exhaustive) | add cases; TypeScript exhaustiveness |
| `ShortcutCommand` | 16 commands | +3 loop | `normalizeShortcutMap` fills defaults | per-command fallback already exists |
| Workspace export | names/URLs/shortcuts | still no last-set / status | import cannot restore a farm | `snapshotFromImport` clears if a future file includes the key |
| IPC `ops:dispatch` | `WorkspaceAction` | union grows | malformed action no-ops in reducer | no protocol version |

## Failure and Edge Cases

| Failure mode | Detection | User/system behavior | Recovery/rollback | Evidence |
|---|---|---|---|---|
| Stop tab with nothing running there | reducer identity | workspace unchanged | none | unit |
| Stop farm with nothing running | identity | unchanged | none | unit |
| Restore with `[]` or all ids gone | identity | no starts | none | unit |
| Deleted id in last-set | filter on delete + restore skip | not recreated | none | unit |
| Hand-close one of many | `setStatus` afterIds nonempty | last-set shrinks | Start all still available | unit |
| Bulk stop of A+B+C | one `stopFarm`/`stopTab` | last-set = A+B+C | restore | unit (proves not `{C}`) |
| Overlay open | interceptor skip | no commit | close overlay | existing |
| Chord conflict on remap | `shortcutConflict` | `prefs/shortcut` no-op | reset row | existing unit |
| Persist fail | existing `saveSnapshot` catch | log; memory state remains | next save | existing |

## Security, NFRs, and Operations

### Security and privacy

Stop/restore must not call `clearAccountSession`. Game views stay sandboxed, no preload. Do not log chord `input.key` beyond existing matcher. Last-set is account ids, not cookies.

### Compatibility, rollout, and rollback

No snapshot version bump. Roll forward: new field defaults. Rollback binary: extra JSON key ignored; running/closed still in snapshot. No cleanup job.

### Observability

No new telemetry. Dogfood journal is the PRD method.

## Tests

- **Unit last-set freeze:** three running; `account/stopFarm` → all closed; `lastRunningAccountIds` is those three, not the last id.
- **Unit stopTab:** running in tab A and tab B; `stopTab` A → only A closed; B still running so last-set becomes B (farm not empty). Restore would not bring A back until the farm has gone empty. Intended: last non-empty farm, not last stopped tab.
- **Unit restore:** last-set `[A,B]`, C closed unused → only A,B running.
- **Unit skip deleted:** last-set contains gone id → remaining start.
- **Unit parse:** missing field `[]`; junk entries dropped.
- **Unit import/export:** export object has no `lastRunningAccountIds`; `snapshotFromImport` `[]`.
- **Unit wipe:** `accountIdsToWipe` for the three actions is `[]`.
- **Unit shortcuts:** three defaults match; `matchShortcut` loop scope; no conflict with `SHORTCUT_DEFAULTS`.
- **Unit i18n:** new keys in all four locales.
- **Integration / e2e:** none. Guest-focus dogfood (G-04).
- **Gates:** `pnpm test` ; `pnpm typecheck`. Do not require `pnpm verify:isolation`.

## Sequencing

1. Snapshot field, parse/export/import, last-set helper, three `applyAction` types, `workspace.test.ts` — no dependencies.
2. `ShortcutCommand` catalog + defaults + matcher tests — no dependency on step 1 (can land with step 1).
3. `accountLoop` maps the three commands — depends on steps 1–2 because it dispatches the new actions and command names.
4. Sidebar trio + i18n four locales — depends on step 1 (dispatch types).
5. Settings labels + README Keyboard rows — depends on step 2.

## Open Questions

- Visible labels/icons for the four footer actions (design, not a contract). Default copy: reuse `startAll`; add `stopTab`, `stopFarm`, `restoreLastSet`.
- Footer layout if four buttons overflow (implementation may wrap; must stay in expanded sidebar, not over the stage).

## Architecture Decision Records

- [ADR-001: Explicit evening/morning trio](adrs/adr-001.md) — product approach
- [ADR-002: Atomic farm verbs in the workspace reducer](adrs/adr-002.md) — this design
