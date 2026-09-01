# AGENTS.md

Instructions for coding agents working in this repository.

## What this is

Idle manager is an Electron desktop shell: many isolated accounts of the same origin tiled in one window, and many game URLs as tabs.
It is a session-isolation product, not a bot, macro tool, or anti-detect browser.

A **tab** is one base URL.
An **account** is one persistent Chromium partition inside that tab.
Account ids are stable UUIDs.
Never key isolation off list index or display name.
Duplicate display names are allowed.

## Commands

Use `pnpm`.
On first install, allow build scripts for `electron` and `esbuild`.

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm dev
pnpm verify:isolation
```

`pnpm verify:isolation` must stay green if you touch partitions, sessions, or `src/main/isolationVerify.ts`.
It is the proof that two `persist:` jars do not share cookies or `localStorage`.

## Layout

```
src/main/        BrowserWindow, WebContentsView, persist sessions, IPC, persistence
src/preload/     contextBridge only (CJS bundle: out/preload/index.cjs)
src/renderer/    React chrome (HeroUI v3, Tailwind v4, Zustand)
src/shared/      pure workspace reducer, layout math, i18n, snapshot parse
```

Aliases: `@shared` everywhere, `@renderer` in the renderer.

## Canonical logic

Workspace mutations belong in `src/shared/workspace.ts` (`applyAction`).
Do not fork tab/account rules in React or in the main process.
Renderer Zustand is a mirror of the main-process snapshot.
Dispatch through `window.opsource.dispatch` / `dispatch()` in `src/renderer/src/store.ts`.

Layout geometry belongs in `src/shared/layout.ts`.
The renderer reports panel holes; main only applies bounds.
Do not re-filter stage panels in `syncViews`.

Disk side effects after a reducer commit belong in `applyDispatchEffects` (`src/main/index.ts`).
Session wipe ids come from `accountIdsToWipe`.
Crash recovery uses `restartView`, not a closed-then-running status pair.

Confirm dialogs use `DialogCommand` (`workspace` | `clear-session`) and `runDialogCommand`.
Do not union `WorkspaceAction` with ad-hoc action shapes.

`parseSnapshot` must reject malformed tabs/accounts.
Import goes through `snapshotFromImport` (sessions start closed).

## Isolation (non-negotiable)

Each account session is:

```ts
session.fromPartition(`persist:opsource-account-${accountId}`)
```

Game views: `WebContentsView`, `sandbox: true`, no Node, no preload, `backgroundThrottling: false`.
Popups must inherit that same `session`.
Closing a panel destroys the view and keeps the partition.
Deleting an account (or wipe-on-tab-delete) clears only that store.
Do not load the game in an iframe, webview tag, or the chrome renderer.

`WebContentsView` paints above HTML.
Menus and modals that overlap the stage must set `overlayOpen` / `popoverOpen` so views hide, or stay entirely inside chrome.

## UI

Chrome is React.
Do not put game documents in the renderer.
HeroUI v3 is compound components (`Modal.Backdrop`, `Dropdown.Popover`, `onPress`).
Theme is Mobbin inverted for dark mode (`data-theme="mobbin-dark"`): ink canvas `#141414`, electric blue `#0066ff` only as a signal.
No gameplay automation UI.

i18n: add keys to all four dictionaries (`en`, `pt`, `es`, `zh-Hans`) in `src/shared/i18n.ts`.

## Tests

Vitest covers `src/shared/**/*.test.ts` only (node environment).
Add tests next to pure logic you change (workspace, layout, partition, snapshot parse).
Do not require Electron for unit tests.

## Out of scope

Do not add:

- gameplay bots, macros, auto-battle, cheat injection
- proxy / fingerprint / anti-detect
- sharing one cookie jar as a “swap user” design
- React Query (there is no remote API)
- a second workspace reducer

Windows is the primary packaging target.
Keep macOS/Linux isolation equivalent if you touch sessions.
