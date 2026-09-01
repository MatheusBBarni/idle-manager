# Account-loop shortcuts — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/keyboard-shortcuts/_prd.md`
- Chrome `keydown` cannot see a focused game `WebContentsView`. Selected design: loop-only main `before-input-event` interceptor over existing `commit()` / `WorkspaceAction`s ([ADR-003](adrs/adr-003.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | Chrome keys: `Shell.tsx` `window` `keydown`; menu `null` | `Shell.tsx`, `index.ts` | 2026-08-30 | Do not add loop chords to Shell |
| Repository | Game views: sandbox, no preload; `before-input-event` only `touch()` | `views.ts` | 2026-08-30 | Attach matcher on those contents |
| Repository | `commit()` applies `applyAction` + `syncViews` | `index.ts` | 2026-08-30 | No new IPC |
| Repository | `account/create` activates only if none active | `workspace.ts` | 2026-08-30 | Create then activate with supplied id |
| Official docs | `preventDefault` on `before-input-event` blocks page keys | [webContents](https://www.electronjs.org/docs/latest/api/web-contents) | Electron 37.10.3 / 2026-08-30 | Match-only preventDefault |
| Official docs | `globalShortcut` is OS-global | [Keyboard Shortcuts](https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts) | 2026-08-30 | Do not use |
| User decision | Loop-only interceptor; chords; skip overlay/editables; shared tests | ADR-003 | 2026-08-30 | Locks this spec |
| Inference | Only the focused `webContents` emits `before-input-event` | Electron focus model | 2026-08-30 | No double `commit` if Shell stays unchanged |

## Technical Goals and Non-Goals

### Goals

- Intercept the four loop chords on chrome **and** live game contents; `preventDefault` only on match — G-01, F-01, F-04–F-07, US-01–US-05
- Map matches to existing actions; keyboard create = `account/create` + `account/activate` with `newId()` — F-02, F-03, G-05
- No-op without tab / empty order / already running — F-06, US-04
- Skip `commit` when `overlayOpen` or chrome editable focused — US-06, Constraints
- Settings + i18n PT/EN read-only list; README table; PT+EN keyboard **docs pages** — F-08–F-10, G-04, US-06
- Mouse Plus dialog unchanged — F-11, US-07
- Unit-test matcher and wrap/create-target; `pnpm test` + `pnpm typecheck` — G-05; G-01 guest-focus is dogfood

### Non-Goals

- Migrating `Mod+T/B/L/R/M`, zoom, `Mod+Tab`, `Mod+1…9` onto the interceptor — PRD out of scope; reconsider if G-02 dogfood demands it
- `globalShortcut`, application menu, new `WorkspaceAction` / IPC / preload on game views
- Electron keyboard e2e job
- Remapping UI, start-all/stop chords, pop-out-specific routing
- Logging `input.key`
- Keyboard bind list as a section on the player landing — ADR-004; landing may only link to `/keyboard/`

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | Chords work with game contents focused | `matchAccountLoopChord` + `before-input-event` | Dogfood; unit match | Guest-focus not in CI |
| G-02 | Do not change Shell README binds | `Shell.tsx` untouched for those keys | Manual checklist | — |
| G-03 | `preventDefault` only after match; no key log | interceptor | Dogfood; matcher tests | — |
| G-04 | Settings list, README, keyboard docs pages | i18n, `Dialogs.tsx`, `site/.../keyboard` | Visual + copy | — |
| G-05 | Create then activate supplied id | `commit` ×2 | `workspace.test.ts` | — |
| US-01 | Create default-name, no dialog; no-op without tab | interceptor + `account/create` | unit + dogfood | — |
| US-02 | Wrap next/prev full `accountOrder` | `nextAccountId` | unit | — |
| US-03 | Start active; no-op if running | `account/setStatus` | unit no-op | — |
| US-04 | No-op first launch | interceptor | unit | — |
| US-05 | Unmatched keys pass | interceptor | matcher null tests | — |
| US-06 | Read-only Settings + docs pages | i18n + Settings + `keyboard` pages | copy | — |
| US-07 | Plus dialog unchanged | `Dialogs.tsx` AccountModal | no behavior change | — |
| F-01–F-11 | As goals/stories above | same | same | — |
| Constraints | Mod chords; no global; no key log; PT/EN; overlay hide; not a bot | ADR-003 | review + tests | — |

## Decision

Loop-only main interceptor (ADR-003). Shared matcher + wrap helper; main `preventDefault` + `commit` on chrome and live game views; create then activate; skip overlay/chrome editables; Shell keeps old shortcuts. **Trade-off:** README shortcuts stay chrome-only; CI does not prove guest-focus.

### Alternatives rejected

- Hidden menu accelerators — user rejected
- Game-view IPC / preload — isolation
- Always-activate create or new action — user rejected
- Intercept all README keys / dual Shell+main — PRD / double fire

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `src/shared/accountLoop.ts` | new | match chords; `nextAccountId`; create+activate action pair | input → command or null | none |
| `src/main/accountLoop.ts` | new | attach listeners; skip overlay/editable; `commit` | Electron input | shared matcher, `commit` |
| `views.ts` `attachSessionHandlers` | existing | hook game contents (create/restart/pop-out) | webContents | main accountLoop |
| `index.ts` createWindow | existing | hook chrome webContents | webContents | main accountLoop |
| `Dialogs.tsx` Settings | existing | read-only list | i18n | `i18n.ts` |
| `Shell.tsx` | existing | unchanged README binds | — | — |
| `site/src/pages/en/keyboard.astro`, `pt/keyboard.astro` | new | Keyboard docs pages | copy | `keyboard.ts` content |
| `site/src/layouts/Landing.astro` | existing | Nav **link** to docs pages (no bind list) | href | `landing.ts` label |

### Data flow

```
focused webContents before-input-event
        │
        ├─ type ≠ keyDown or repeat → ignore (no preventDefault)
        ├─ matchAccountLoopChord = null → ignore
        ├─ overlayOpen or (chrome contents && editable) → ignore
        ├─ account-create + activeTabId → preventDefault → newId → create + activate
        ├─ account-prev/next → preventDefault → nextAccountId → activate
        └─ account-start + activeAccount → preventDefault → setStatus running
```

Skip paths never `preventDefault`. Dispatch paths `preventDefault` then `commit`.

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `src/shared/accountLoop.ts` (+ test) | new | wrong match | unit tests |
| `src/shared/workspace.test.ts` | add create+activate case | G-05 | test |
| `src/main/accountLoop.ts` | new | missed attach | attach via `attachSessionHandlers` + chrome |
| `src/main/views.ts` | call attach | restartView drop | use existing attach helper |
| `src/main/index.ts` | chrome attach; pass commit/overlay | wiring | wire |
| `src/shared/i18n.ts` | PT/EN shortcut labels | missing locale | both maps |
| `Dialogs.tsx` | Settings block | overlay already hides views | add list only |
| `README.md` | Keyboard table | drift | same four accelerators |
| `site/src/content/keyboard.ts` (+ copy test) | new | copy drift | four accelerators |
| `site/src/pages/en/keyboard.astro`, `pt/keyboard.astro` | new | 404 if locale missing | both locales |
| `site/src/content/landing.ts`, `Landing.astro` | nav link only | burying the page | Keyboard → docs URL |

## Contracts

### Public interfaces

```ts
export type AccountLoopCommand =
  | 'account-create'
  | 'account-prev'
  | 'account-next'
  | 'account-start'

export type AccountLoopKeyInput = {
  type: 'keyDown' | 'keyUp'
  key: string
  code: string
  control: boolean
  meta: boolean
  shift: boolean
  alt: boolean
  isAutoRepeat: boolean
}

export function matchAccountLoopChord(input: AccountLoopKeyInput): AccountLoopCommand | null

export function nextAccountId(
  accountOrder: string[],
  activeId: string | null,
  delta: -1 | 1
): string | null

export function keyboardCreateActions(tabId: string, id: string): WorkspaceAction[]
// [{ type: 'account/create', tabId, id }, { type: 'account/activate', id }]
```

Matcher rules (keydown only, `isAutoRepeat` false, `alt` false):

| Command | macOS (`meta`) / Win·Linux (`control`) | `shift` | `key` |
|---|---|---|---|
| `account-create` | mod | true | `n` or `N` |
| `account-prev` | mod | true | `[` |
| `account-next` | mod | true | `]` |
| `account-start` | mod | false | `Enter` |

`nextAccountId`: empty order → `null`; else wrap `indexOf(activeId)` (or `0` if not in list) by `delta`.

No new `OpsourceAPI` / IPC / `WorkspaceAction` variants. `StageReport.overlayOpen` unchanged.

Display strings (Settings, README, docs pages): `Ctrl+Shift+N` / `⌘⇧N`, `Ctrl+Shift+[` / `⌘⇧[`, `Ctrl+Shift+]` / `⌘⇧]`, `Ctrl+Enter` / `⌘↩` — glyphs via i18n, same four chords.

Public docs URLs (Astro `base` + locale prefix + `trailingSlash: always`):

- `{base}/en/keyboard/`
- `{base}/pt/keyboard/`

### Data model

No snapshot schema change. Keyboard create uses `newId()` (`src/shared/ids.ts`). Empty name → existing `nextAccountName`.

### Errors

| Case | Behavior |
|---|---|
| No `activeTabId` | no `commit` |
| `account/create` on archived/missing tab | reducer no-op |
| `nextAccountId` null | no `commit` |
| No active account on start | no `commit` |
| Already `running` | `setStatus running` is idempotent |
| Matcher null | no `preventDefault` |

### Changed boundaries

| Boundary | Current | Change | Failure | Compatibility |
|---|---|---|---|---|
| Game `before-input-event` | `touch()` only | after `touch`, maybe match | unmatched pass | activity timestamps unchanged |
| Chrome webContents | no loop handler | same matcher | skip if editable | Shell keys unchanged |
| Settings UI | locale/theme/export | read-only list | overlay hides views | no prefs schema |
| Site docs | no `/keyboard/` routes | locale docs pages | copy drift | new routes; landing stays marketing |
| Player landing | no Keyboard nav | link to docs page, no bind list | buried URL | still one marketing landing |

## Failure and Edge Cases

| Failure mode | Detection | Behavior | Recovery | Evidence |
|---|---|---|---|---|
| No tab / empty order | snapshot | no commit | user `Mod+T` | unit |
| Overlay / Settings open | `overlayOpen` | no commit, no preventDefault | close overlay | code path |
| Chrome URL bar / dialog field | editable focused on chrome contents | no commit, no preventDefault | blur | code path |
| Guest view focused | `before-input-event` on that contents | match → preventDefault + commit | — | dogfood G-01 |
| `restartView` | crash path | attach in `attachSessionHandlers` | restart still loops | review |
| Chord vs game | allowlist | unmatched reach page | G-03 dogfood | dogfood |
| Double create | Shell not registered | single commit | — | ADR-003 |

## Security, NFRs, and Operations

### Security and privacy

- Guest: sandbox, no preload, no Node — unchanged.
- Intercept allowlisted Mod chords only; never persist `input.key`.
- `touch()` stays identity-free.
- Not `globalShortcut`.
- Start is `setStatus`, never injected game keystrokes.

### Compatibility, rollout, rollback

- No snapshot migration.
- Remove listeners + copy to roll back.
- Windows primary; same chords via `control` vs `meta`.

### Observability

- No shortcut metrics (PRD: no telemetry).
- Do not log keys. Persist failures stay existing `persist failed`.

## Tests

- **Unit:** `matchAccountLoopChord` — each of four hits; keyUp/repeat/alt/bare `n` → null; non-mod → null
- **Unit:** `nextAccountId` — wrap, single item, empty, unknown active
- **Unit:** `keyboardCreateActions` then `applyAction` — new id is `activeAccountId`; mouse create without id still does not steal active when one exists
- **Integration:** none new (no Electron harness)
- **Platform / e2e:** G-01 dogfood; G-02 chrome README checklist
- **Gates:** `pnpm test` ; `pnpm typecheck` ; do not require `pnpm verify:isolation` unless `views.ts` session code changes beyond the input hook

## Sequencing

1. `accountLoop` matcher + `nextAccountId` + `keyboardCreateActions` + tests — no dependencies.
2. Main interceptor + attach on chrome and `attachSessionHandlers` — depends on 1 because commit must call the same matcher.
3. i18n + Settings list — depends on 2 chords frozen.
4. README Keyboard rows — depends on 3 (same labels).
5. Keyboard docs pages (`en/keyboard`, `pt/keyboard`) + landing nav link — depends on 3.

## Open Questions

- Chrome editable probe (`executeJavaScript` vs `webContents` focus helpers) — implementation detail; skip rule is fixed.
- Whether `[` / `]` matching should also accept `{` / `}` when Shift is held on some layouts — implementer spike; matcher tests must pin the chosen `key` values.

## Architecture Decision Records

- [ADR-001](adrs/adr-001.md) — mouse-free loop product
- [ADR-002](adrs/adr-002.md) — Settings + README (site surface superseded)
- [ADR-003](adrs/adr-003.md) — loop-only main interceptor + chords
- [ADR-004](adrs/adr-004.md) — PT+EN `/keyboard/` docs pages
