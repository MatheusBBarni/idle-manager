# Shortcut remapping — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/shortcut-remapping/_prd.md`
- Loop chords are a frozen matcher on main `before-input-event`; chrome README chords are a second frozen table on `Shell.tsx`. Selected design: one shared catalog + full snapshot map; both paths consume it; capture stays in Settings ([ADR-002](adrs/adr-002.md), [ADR-003](adrs/adr-003.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | Loop interceptor skips `overlayOpen` | `src/main/accountLoop.ts` | 2026-08-31 | Capture cannot use that listener |
| Repository | Chrome binds are `Shell.tsx` `keydown` | `Shell.tsx` | 2026-08-31 | Keep chrome-only path |
| Repository | Snapshot v1; bad locale → `pt` | `parseSnapshot` | 2026-08-31 | Do not bump version; fail per command |
| Official docs | `preventDefault` on `before-input-event` blocks the page | Electron 37.10.3 | 2026-08-31 | Match-only preventDefault |
| Official docs | HeroUI v3 `Tabs` is compound `List`/`Tab`/`Panel` | [Tabs](https://heroui.com/docs/react/components/tabs) | v3.0.5 | Settings panes |
| User decision | Dual paths; renderer capture; full map; `{key,shift,alt}`; per-command fallback | ADR-002, ADR-003 | 2026-08-31 | Locks this spec |
| Inference | Only focused `webContents` emits `before-input-event` | Electron focus model | 2026-08-31 | Shell + interceptor do not double-commit loop commands if Shell never matches `loop` scope |

## Technical Goals and Non-Goals

### Goals

- Shared catalog, chord identity, matcher, and defaults in `src/shared` — F-03–F-08, G-03
- Full `shortcuts` map on snapshot v1; `prefs/shortcut`; export workspace includes map; game-list does not — F-09, F-10, US-07, US-08
- Loop interceptor reads the map; attach points unchanged — F-06, G-01
- Shell chrome keydown reads the same map, `chrome` scope only — F-07, G-02
- Settings General + Shortcuts tabs; renderer capture; overlay skip unchanged — F-01–F-05, US-01, US-04, US-05
- Parse/apply fail closed per command — F-04, Constraints
- Unit-test matcher, identity, parse, `prefs/shortcut`; `pnpm test` + `pnpm typecheck` — G-05; guest-focus is dogfood

### Non-Goals

- Moving chrome commands onto `before-input-event` — ADR-002; reconsider if dual-path drift fails G-02
- `globalShortcut`, game preload, new IPC, snapshot version bump
- Unbind, steal-on-conflict, sparse disk map
- README / `/keyboard/` showing custom maps
- Electron keyboard e2e; `verify:isolation` unless session attach changes
- Logging `input.key`

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | Loop matcher uses map on game contents | `matchShortcut(..., 'loop')` + interceptor | Dogfood; unit match | Guest-focus not in CI |
| G-02 | Chrome matcher uses map only in Shell | `matchShortcut(..., 'chrome')` | Manual + unit | — |
| G-03 | No match without platform mod; unmatched pass | matcher | unit null cases | — |
| G-04 | Settings Shortcuts tab lists catalog | `Dialogs.tsx` Tabs | visual + i18n | — |
| G-05 | Missing map → defaults | `parseSnapshot` | unit | — |
| US-01 | General + Shortcuts panes | HeroUI Tabs | visual | — |
| US-02 | Remap four loop commands; old chord free | map + interceptor | unit + dogfood | — |
| US-03 | Remap chrome; no fire on game focus | Shell vs interceptor scope | unit scope; dogfood | — |
| US-04 | Duplicate/illegal/cancel leave row | capture + `prefs/shortcut` no-op | unit + capture paths | — |
| US-05 | Reset writes shipped default | `prefs/shortcut` chord `null` | unit | — |
| US-06 | Bare keys reach game | matcher null | unit | — |
| US-07 | Full map persisted / exported | snapshot + `exportMetadata` | unit parse/export | — |
| US-08 | Never-opened → defaults | `emptySnapshot` / parse missing | unit | — |
| F-01–F-10 | As rows above | same | same | — |
| Constraints | Mod-only; no global; no key log; all chrome locales; overlay hide; slot family; game-list omits map; not a bot | ADR-002/003 | review + tests | — |

## Decision

Shared catalog and matcher; full snapshot map; loop interceptor and Shell both consume it with an explicit scope; renderer capture; per-command parse fallback ([ADR-002](adrs/adr-002.md), [ADR-003](adrs/adr-003.md)). **Trade-off:** two live listeners; existing files freeze chords after first full write.

### Alternatives rejected

- Unify onto interceptor — user rejected (game-key steal risk)
- Loop-only matcher — user rejected (conflict drift)
- Sparse overrides / whole-map reset — user rejected

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `src/shared/shortcuts.ts` | new | catalog, defaults, identity, `matchShortcut`, parse/normalize | input + map → command \| null | none |
| `src/shared/types.ts` / `workspace.ts` | existing | `shortcuts` field; `prefs/shortcut`; parse; export | snapshot | shortcuts module |
| `src/shared/accountLoop.ts` | existing | keep wrap/create helpers; matching delegates to shortcuts `loop` | command | shortcuts |
| `src/main/accountLoop.ts` | existing | interceptor uses `getSnapshot().shortcuts` | Electron input | shared matcher |
| `Shell.tsx` | existing | chrome dispatch via matcher; skip if capturing | KeyboardEvent | snapshot, store flag |
| `Dialogs.tsx` Settings | existing | Tabs; capture; dispatch `prefs/shortcut` | UI | i18n, shortcuts |
| `src/renderer/src/store.ts` | existing | renderer-only `shortcutCapturing` flag | boolean | Shell, Settings |
| README / site keyboard | existing | **unchanged defaults** | — | — |

### Data flow

```
live key
  ├─ Settings capturing? → renderer: legal unique chord → prefs/shortcut
  │                         Escape → end capture, no dispatch, modal stays
  │                         illegal/duplicate → no-op, row unchanged
  ├─ overlayOpen → loop interceptor ignore (unchanged)
  ├─ matchShortcut(map, loop) on focused contents → preventDefault + commit
  └─ matchShortcut(map, chrome) on Shell → preventDefault + existing chrome actions
```

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `shortcuts.ts` + test | new | identity bugs | unit catalog |
| `types.ts` / `workspace.ts` + test | schema | import steal | parse + apply tests |
| `accountLoop.ts` shared/main | read map | stale frozen match | delete frozen chord table from match |
| `Shell.tsx` | use matcher | fire during capture | capturing short-circuit |
| `Dialogs.tsx` / `i18n.ts` | tabs + capture | overlay already hides views | all `LOCALES` |
| `exportMetadata` | add shortcuts | game-list must stay clean | test omission |
| README / docs | none | drift if someone “fixes” them to live maps | leave defaults |

## Contracts

### Public interfaces

```ts
export type ShortcutCommand =
  | 'tab-new' | 'tab-reopen' | 'sidebar-toggle' | 'url-focus'
  | 'account-reload' | 'tab-reload' | 'account-mute'
  | 'account-zoom-in' | 'account-zoom-out' | 'account-zoom-reset'
  | 'tab-next' | 'account-slot'
  | 'account-create' | 'account-prev' | 'account-next' | 'account-start'

export type ShortcutScope = 'loop' | 'chrome'

export type ShortcutChord = { key: string; shift: boolean; alt: boolean }

export type ShortcutMap = Record<ShortcutCommand, ShortcutChord>

export const LOOP_COMMANDS: readonly ShortcutCommand[]
export const CHROME_COMMANDS: readonly ShortcutCommand[]
export const SHORTCUT_DEFAULTS: ShortcutMap

export type ShortcutKeyInput = {
  type: string
  key: string
  control: boolean
  meta: boolean
  shift: boolean
  alt: boolean
  isAutoRepeat: boolean
}

export function matchShortcut(
  input: ShortcutKeyInput,
  map: ShortcutMap,
  scope: ShortcutScope
): ShortcutCommand | null

export function chordIdentity(chord: ShortcutChord): string
export function normalizeShortcutMap(raw: unknown): ShortcutMap
export function shortcutConflict(
  map: ShortcutMap,
  command: ShortcutCommand,
  chord: ShortcutChord
): ShortcutCommand | null

export function displayShortcut(chord: ShortcutChord, platform: 'darwin' | 'win'): string
```

`WorkspaceAction` adds `{ type: 'prefs/shortcut'; command: ShortcutCommand; chord: ShortcutChord | null }`  
`chord: null` = reset that command to `SHORTCUT_DEFAULTS[command]` (still stored).

`WorkspaceSnapshot` / `WorkspaceExport` add `shortcuts: ShortcutMap`. Version remains `1`.

Matcher: `keyDown` only; not repeat; `meta || control`; never match without that mod. Compare `shift`, `alt`, and case-folded `key` (zoom-in also accepts `+` when stored key is `=`). `account-slot`: same shift/alt as stored; `key` in `1`–`9`. `tab-next`: stored chord is Next; Previous is same key/alt with **inverted** `shift` (not a catalog row). Default `account-prev`/`next` also accept `{`/`}` when stored key is `[`/`]`.

Conflict: identity is `alt|shift|keyLower`, except `account-slot` occupies **all** keys `1`–`9` at that shift/alt. `shortcutConflict` used by UI and reducer.

Shipped defaults (Win `Ctrl` / macOS `⌘`):

| Command | Chord | Display |
|---|---|---|
| tab-new | t | Ctrl+T |
| tab-reopen | Shift+t | Ctrl+Shift+T |
| sidebar-toggle | b | Ctrl+B |
| url-focus | l | Ctrl+L |
| account-reload | r | Ctrl+R |
| tab-reload | Shift+r | Ctrl+Shift+R |
| account-mute | m | Ctrl+M |
| account-zoom-in | = | Ctrl+= |
| account-zoom-out | - | Ctrl+- |
| account-zoom-reset | 0 | Ctrl+0 |
| tab-next | Tab | Ctrl+Tab |
| account-slot | 1 (family) | Ctrl+1…9 |
| account-create | Shift+n | Ctrl+Shift+N |
| account-prev | Shift+[ | Ctrl+Shift+[ |
| account-next | Shift+] | Ctrl+Shift+] |
| account-start | Enter | Ctrl+Enter |

Loop scope: create, prev, next, start. Chrome scope: all others. `account-slot` is chrome-only (today’s `Shell.tsx`).

No new `OpsourceAPI` methods.

### Data model

- Ownership: workspace snapshot, same as locale/theme.
- Retention: until overwritten or workspace import replace.
- Concurrency: last `prefs/shortcut` wins.
- `emptySnapshot().shortcuts === SHORTCUT_DEFAULTS`.
- `normalizeShortcutMap`: missing field → defaults; unknown command ignored; invalid chord or duplicate (later catalog order) → that command’s default.

### Errors

| Case | Behavior |
|---|---|
| Illegal chord (no mod, empty key) | capture refuses; reducer no-op |
| Taken chord | capture refuses; reducer no-op |
| Escape / blur capture | end capture; no dispatch |
| Overlay open | loop interceptor unchanged (no commit) |
| Capturing | Shell does not dispatch chrome commands |

### Changed boundaries

| Boundary | Current | Change | Failure | Compatibility |
|---|---|---|---|---|
| Snapshot | no shortcuts | full map | per-command default | v1 files without field |
| Workspace export | locale/theme | + shortcuts | parse fallback | game-list unchanged |
| Loop interceptor | frozen match | map | skip overlay | attach unchanged |
| Shell keydown | frozen | map + capturing guard | — | chrome-only |
| Settings | read-only 4 rows | Tabs + capture | overlay hides views | General pane kept |

## Failure and Edge Cases

| Failure mode | Detection | Behavior | Recovery | Evidence |
|---|---|---|---|---|
| Duplicate / illegal assign | identity + mod check | no-op | pick another / reset occupant | unit |
| Corrupt disk row | parse | that command defaults | remap | unit |
| Old snapshot | missing field | all defaults then persist | — | unit |
| Capture vs modal ESC | capturing flag | cancel capture only | click row again | code path |
| Game typing | unmatched | no preventDefault | — | unit + G-03 dogfood |
| Slot vs Ctrl+1 command | occupancy 1–9 | conflict | parking-spot chord | unit |

## Security, NFRs, and Operations

### Security and privacy

- Guest sandbox/preload unchanged.
- Do not persist or log raw key events; store only `{key,shift,alt}` for catalog commands.
- Not `globalShortcut`. No injected game keystrokes.

### Compatibility, rollout, and rollback

- No version bump. Ignore `shortcuts` to roll back.
- First save after upgrade writes the full default map (freezes later default edits for that file).
- Windows primary; runtime accepts Ctrl or Meta as the implied mod (today’s matcher).

### Observability

- No shortcut telemetry. Do not log keys.

## Tests

- **Unit:** `matchShortcut` each default; loop vs chrome scope; no-mod / keyUp / repeat → null; slot 1–9; tab-next shift invert; `[`/`{` default prev
- **Unit:** `normalizeShortcutMap` missing, junk chord, duplicate later-wins-default, unknown command
- **Unit:** `applyAction` `prefs/shortcut` set, reset, duplicate no-op, illegal no-op; `exportMetadata` has map; `exportGameList` does not
- **Integration:** none (no Electron harness)
- **Platform / e2e:** G-01 dogfood; G-02 chrome checklist
- **Gates:** `pnpm test` ; `pnpm typecheck`

## Sequencing

1. `shortcuts.ts` catalog, defaults, identity, matcher, normalize + tests — no dependencies.
2. Snapshot field, `prefs/shortcut`, parse, export + tests — depends on 1 (types).
3. Interceptor + `accountLoop` consume map — depends on 2.
4. Shell consume map + capturing flag — depends on 2 because identity must match interceptor.
5. Settings Tabs, capture, i18n all `LOCALES` — depends on 4 so capture cannot race live Shell dispatch.

## Open Questions

- Capture canonicalization when Shift+[ yields `{` on some layouts — keep default dual-match; custom chords store `event.key` as captured.
- Settings modal width for the tabbed list — layout only; catalog is fixed.

## Architecture Decision Records

- [ADR-001](adrs/adr-001.md) — product: Settings Shortcuts tab, all documented actions
- [ADR-002](adrs/adr-002.md) — shared catalog, dual dispatch, renderer capture
- [ADR-003](adrs/adr-003.md) — full snapshot map, implied mod, per-command fallback
