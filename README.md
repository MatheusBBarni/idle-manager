# Opsource

Desktop shell for running many isolated accounts of the same idle game in one window, and many game URLs as tabs.

This is a session-isolation product, not a bot.

## Why Electron

A web app cannot keep two live first-party sessions of the same origin on screen at once.
Browsers key cookies, `localStorage`, IndexedDB, cache, and service workers by origin, so two views of `https://gengar.com.br` share one jar.

Opsource is an Electron app because Chromium gives a portable primitive for that:

- One account maps to `session.fromPartition('persist:opsource-account-{accountId}')`.
- Each running account is a `WebContentsView` inside the main window.
- The partition is persistent on disk, so logins survive restart until the user deletes the account or clears that session.
- Popups inherit the same session, so OAuth or Discord links do not leak into another account.

Tauri and system webviews do not give the same partition model on every OS.
Electrobun has a similar idea, but Electron is the proven engine for loading arbitrary Chrome-class game sites.

Windows is the primary target.
macOS and Linux work with the same isolation primitive.

## Stack

- Electron 37 + electron-vite
- React 19 chrome UI
- Zustand for the workspace snapshot (tabs, accounts, layout, prefs)
- HeroUI v3 + Tailwind CSS v4
- No React Query: there is no remote API. Metrics arrive over IPC.

The chrome is React.
Game documents are native `WebContentsView`s laid into holes reported by the renderer.
That is required so each account has a real Chromium process and its own cookie jar.

## Isolation check

```bash
pnpm verify:isolation
```

The process creates two persistent partitions, writes different cookies for `https://gengar.com.br`, then writes different `localStorage` values on a privileged local origin.
It exits `0` only if the two jars stay distinct.

Manual check of the product:

1. Create a tab with a game URL.
2. Add two accounts, start both, log into different users.
3. Quit and reopen. Both sessions should still be logged in.
4. In DevTools Application storage, the two views must not share cookies or `localStorage`.

## Develop

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm dev
```

`pnpm pack` builds an unpackaged app.
`pnpm dist` builds a Windows NSIS installer (and dmg/AppImage on other OS).

## Layout

A **tab** is one game URL.
An **account** is one isolated session inside that tab.
Closing a panel tears down the view and keeps the store.
Deleting an account wipes only that partition.
Closing a tab archives it. Accounts keep running until you close them.

## Privacy

Workspace metadata is stored in the app user-data directory.
When OS encryption is available (`safeStorage`), that file is encrypted.
Chromium session directories stay in the local profile and never go to a server.
Import/export writes account names and URLs only, not cookie databases.
