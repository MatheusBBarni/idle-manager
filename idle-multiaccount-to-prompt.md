# Prompt: Multi-account idle web-game client (Idle Labs–class)

You are implementing a product from a blank slate. Decide architecture and stack from the requirements and constraints below. Do not assume a stack was already chosen.

## Goal

Build a desktop shell that runs **many isolated accounts inside one tab**, and **many tabs for different games (URLs)**, all in one window.

- A **tab** = one game / one base URL (e.g. tab “Gengar” → `https://gengar.com.br/`, tab “Other idle” → another site).
- Inside a tab = **N accounts** of that same game, tiled as panels, each a fully isolated session (own cookies, cache, storage, login).
- `gengar.com.br` is only an example URL. The user can add any number of tabs pointing at any sites.

Reference product: Idle Labs (https://idle-labs.com/). This is a **session-isolation + tab + layout shell**, not a game bot or site-specific companion. It loads the real site like a browser.

## Reference product — observed behavior

From Idle Labs marketing + a Windows screenshot (app version 1.1.6):

**Chrome-like chrome**
- Title bar: “Idle Labs”
- Top navigation: back, forward, reload, home, URL bar (`https://gengar.com.br/`), share, reload-all-ish icons, mute, search, grid, download, layout, settings, help
- Two account panels visible side by side inside one window
- Left sidebar account list + workspace switcher
- Bottom status bar: connection, workspace name, layout name, active account, aggregate CPU %, RAM, FPS, uptime, version

**Accounts sidebar**
- Workspaces (example: “Principal”) with edit/layout icons
- Account rows: color dot, display name, status (`Online` / `Closed`), optional live `CPU x%` and `RAM xxx MB`, last-activity timer (e.g. `9s`)
- Duplicate display names allowed (two “Conta 2” rows exist)
- Closed accounts stay in the list
- `+ Add account` and a play/start control
- Icon rail on the far left (workspace/feature shortcuts)

**Panels**
- Each panel has its own title (`Conta 1 gengar.com.br`, `Conta 2 www.gengar.com.br`)
- Per-panel: mute, pop-out/display, reload, zoom, close
- Same login page rendered twice independently (trainer name + password + Entrar / Criar conta)
- Discord CTA under the login card is part of the **game page**, not the shell

**Performance claims (Idle Labs)**
- Isolated `WebContentsView` per account
- One process per account
- ~120–170 MB RAM per account
- ~46 FPS with 6 accounts (~1.1 GB total)
- Per-account CPU/RAM visible live
- Per-account audio + zoom + mute
- Persistent isolated sessions (cookies, cache, login)
- Local encrypted session data on disk
- Windows installer only today; Mac/Linux “maybe later”
- One-time license, device binding, auto-update with integrity check
- Import/export of config
- Layouts: auto grid, single panel, columns, rows, free drag
- Unlimited accounts per workspace
- Keyboard shortcuts: switch panel, reload, mute, zoom

Idle Labs’ own wording (“WebContentsView isolada”, one process per account) matches a Chromium-embed desktop shell, not a browser tab manager.

## Problem a web app cannot solve

Browsers key first-party cookies, `localStorage`, `IndexedDB`, cache, and Service Workers by **origin** (scheme + host + port). Two live views of `https://gengar.com.br` in the same browser profile share one jar.

Consequences:
- Logging into account B overwrites or collides with account A
- Logout on one view logs the other out
- Games that store trainer id / tokens in `localStorage` leak across “accounts”
- CHIPS / partitioned cookies only isolate **third-party** cookies by top-level site; they do not give two first-party sessions of the same site
- Same-origin iframes share storage
- A PWA or SPA hosted on another origin embedding the game in iframes hits third-party cookie blocking; many games will not stay logged in
- Chrome Multi-Login–style extensions typically swap or virtualize storage **per tab** and often **ephemeral**; they are not a tiled, persistent, metered multi-process shell
- Firefox Multi-Account Containers are a browser feature, not a shippable standalone product with custom layouts and per-account process metrics

**Conclusion for this product:** a pure web app cannot meet the core requirement (several **simultaneous**, **persistent**, **fully isolated** sessions of the **same origin**, tiled in one window, with per-session cache/cookies/storage). A browser extension is a weaker adjacent product (sequential or tab-isolated, no real process metrics, poor layout control, store policies). The product class is a **desktop multi-session browser**.

Out of scope unless explicitly added later: fingerprint spoofing, proxy-per-account, anti-detect browsers, automation of gameplay.

## Information architecture (authoritative)

```
Window
  └── Tabs[]                    // one tab per game / URL
        ├── tab.id              // stable
        ├── tab.name
        ├── tab.baseUrl         // e.g. https://gengar.com.br/
        ├── tab.layout          // auto grid | single | columns | rows | free
        └── Accounts[]          // many accounts of THAT game, same tab
              ├── account.id    // stable, never reuse list index
              ├── account.name, color
              ├── account.url   // usually tab.baseUrl; may differ (www vs apex, deep link)
              ├── account.status  // running | closed
              └── isolated web session bound only to this account.id
```

Switching tabs changes which game’s account grid is shown. Accounts in a hidden tab may keep running (sessions stay alive) unless the user closed them. Isolation is **per account**, not per tab: two accounts in the same tab on the same origin must not share storage.

Idle Labs “workspaces” map closest to **tabs** in this product (one workspace/tab per game). Do not collapse “tab” and “account” into one concept.

## Functional requirements

### Tabs (games / URLs)
- Create, rename, reorder, close tabs
- Each tab has a base URL the user sets (any site, not hardcoded games)
- Closing a tab does not delete account session data unless the user also deletes the accounts
- Multiple tabs can target the same URL if the user wants two separate groups
- The top URL bar reflects the **active account inside the active tab**
- Changing the URL bar navigates only the active account, not every account in the tab

### Accounts (inside a tab)
- Create, rename, recolor, reorder, delete accounts **within the active tab**
- Each account has a stable internal id that never changes when the list is sorted
- New accounts inherit the tab base URL; an account may override URL
- Status: closed vs running
- Starting an account opens its isolated web session in that tab’s layout; closing the panel tears down the view but **must not** destroy persisted storage unless the user deletes the account or chooses “clear session”
- Duplicate display names allowed
- A tab can show 1–N account panels at once (the “multiple accounts in the same tab” requirement)

### Session isolation (non-negotiable)
Each running account must have its own:
- cookies (including HttpOnly)
- cache
- `localStorage` / `sessionStorage`
- IndexedDB
- Service Workers
- login state

Account A must be able to stay logged into site X while account B is logged into a different user on the same site X, both visible at once.

Sessions must survive app restart when marked persistent.

### Layout / workspaces
- Layout is **per tab**: auto grid, single focused panel, columns, rows, free drag-resize
- Show 1–N running accounts of the **active tab** tiled in the main area
- Switching tabs changes the visible grid; running accounts in background tabs keep their sessions unless closed
- Active tab + active account highlighted in sidebar and status bar

### Per-account view controls
- Back / forward / reload (global URL bar may reflect the active panel)
- Mute / unmute audio independently
- Zoom independently
- Optional pop-out to a separate window that keeps the same session
- Close view (session data remains)

### Observability
- Live CPU and RAM per running account when the platform can provide it
- Aggregate CPU, RAM, FPS (or equivalent) in a status bar
- Online/offline and a cheap “last activity” timer

### Persistence and privacy
- Tabs, accounts, per-tab layout, window state stored locally
- Session stores on disk, not on a server
- App vendor must not receive game passwords
- Optional encryption-at-rest for session directories
- Import / export of workspace + account metadata (not necessarily raw cookie DBs)

### App lifecycle
- Start with OS (optional)
- Reopen last tab + running accounts
- Auto-update path exists
- Theme + language (PT/EN at minimum; reference UI is Portuguese)

### Platforms
- Windows is the primary target (matches reference and the largest idle-game desktop audience)
- macOS and Linux are desirable if isolation quality does not regress

## User flows

1. First launch → create tab with base URL (e.g. gengar.com.br) → add account → start → login in the panel → quit → reopen → still logged in
2. Same tab: add second account, start both → two login forms of the same game, two users, no session bleed
3. Arrange that tab’s accounts in auto grid (2 / 4 / 6); mute / zoom / reload one account only
4. Close panel for account 2; account 1 keeps running; reopen account 2 later still logged in
5. New tab with a different game URL → add accounts there → switching tabs shows the other game’s grid; first tab’s accounts stay logged in
6. Delete an account → only that account’s isolated storage is wiped
7. Close a tab in the UI without deleting accounts → accounts and sessions remain when the tab is reopened

## Edge cases

- Site uses Service Workers and Cache API
- Site is a PWA / uses IndexedDB for auth
- `www` vs apex host (`gengar.com.br` vs `www.gengar.com.br`) — accounts may point at different URLs; isolation is per session, not per host
- Popups / OAuth / Discord links opened from a panel must not leak into another account’s session
- Background throttling: idle games must keep running when the panel is not focused (timers, websocket, RAF). Hidden/background views must not be frozen by default
- Many accounts: memory will be large; UI must remain usable when some accounts are Closed
- Crash of one account’s renderer must not kill the shell or other accounts
- Mixed HTTP/HTTPS, older game stacks, WebGL/canvas
- Audio from several games at once
- User pastes a URL in the top bar: it should apply to the **active** account only

## Constraints

- No gameplay automation, no injecting game cheats, no sharing one cookie jar with “swap user” hacks as the primary design
- Do not prescribe a particular CSS framework or UI library
- Licensing/paywall like Idle Labs is **out of scope** for v1 unless needed for updates
- Target users: people already juggling Chrome profiles / incognito windows for idle MMOs

## Research: desktop runtimes (facts, not a mandate)

The receiving model must pick a runtime that can actually deliver **named persistent storage partitions + multiple live web contents in one window + unthrottled background pages + consistent modern web engine**.

### Electron
- `session.fromPartition('persist:<stableAccountId>')` isolates cookies, cache, DOM storage, IndexedDB, Service Workers
- `WebContentsView` (replacement for deprecated `BrowserView`) embeds multiple web contents in one `BrowserWindow` — same primitive Idle Labs names
- Chromium is bundled → behavior matches Chrome for arbitrary games
- Per-view mute, zoom, `backgroundThrottling`
- Process-per-site/view model can expose CPU/RAM-ish metrics
- Cost: large installer, high RAM per view (Idle Labs’ 120–170 MB/account is consistent with this model)
- Ecosystem for “mini browser” apps is the most proven

### Tauri (WebView2 / WKWebView / WebKitGTK via wry)
- Smaller shell, Rust core, system webview
- Multi-webview-in-one-window exists but is an unstable/advanced API
- Isolation is **not one portable primitive**:
  - Feature request still open historically: “Enhanced WebView Isolation for Multi-User Login” (tauri#11491) — callers needed per-user `WKWebsiteDataStore` on macOS
  - Windows: wry added `with_profile_name` (WebView2 named profiles) to isolate cookies/storage/IDB/cache without a second WebView2 environment; `with_data_directory` is the older, heavier workaround and has caused OAuth/login regressions in downstream apps
  - Linux: separate `WebContext` isolates; shared context shares storage
- Engine version = whatever WebView2/WebKit the OS has → idle games can break or look different per machine
- Per-account process metrics and “one process per account” are weaker / OS-specific
- Better when the app is mostly *your* UI talking to *your* backend; weaker as a generic multi-session browser

### Electrobun
- `<electrobun-webview partition="...">` is documented for separate session storage in multi-user apps
- Custom OOPIF-style isolated webviews composited into one UI (explicit multi-tab browser use case)
- Can use system webview **or** pinned Chromium/CEF
- System webview keeps the binary small; CEF is what you need for Chrome-like game compatibility, and independent 2026 benchmarks showed Electrobun jumping to ~400 MB+ once Chromium had to be bundled for missing system-webview APIs
- v1 shipped early 2026; ecosystem, docs, and long-term engine policy are thinner than Electron/Tauri
- Partition persistence across upgrades and per-view resource metrics need to be treated as unknown until proven

### Comparison that matters for *this* product

| Need | Web app | Electron | Tauri | Electrobun |
|---|---|---|---|---|
| Simultaneous same-origin logins | No | Yes (`persist:` partitions) | Partial / OS-specific | Yes if partition works as documented |
| Persistent sessions on disk | N/A | Yes | Yes if data dir/profile wired | Documented partition; verify persist |
| Tiled views in one window | CSS only, shared origin | WebContentsView | Unstable multi-webview | First-class isolated webviews |
| Engine consistent with Chrome games | Browser of user | Bundled Chromium | System webview variance | System or CEF |
| Per-view mute/zoom/metrics | No | Mature | Limited | Less proven |
| Background idle without throttle | Tabs freeze | Configurable | OS webview policy | Needs verification |
| Installer size | Zero | Large | Small | Small or large depending on CEF |
| Maturity for a commercial shell | — | High | High for normal apps, low for this pattern | Low–medium |

A web app is not viable for the stated product. Among desktop options, the product’s hard requirement is **portable, persistent, per-account web storage partitions plus multiple live documents of arbitrary sites**. That requirement is first-class and battle-tested in Electron. Tauri can approach it on Windows via WebView2 profiles but is uneven across OS and engines. Electrobun has the right UI primitive and partition attribute but less production evidence.

## Success criteria

- One tab, two panels of the same URL, two logged-in users, both survive restart
- Second tab with a different URL; switching tabs does not mix sessions or log anyone out
- No cookie/`localStorage` bleed in DevTools between partitions
- Closing one renderer does not log out the other
- Auto-grid of at least 4 running sessions remains usable
- Hidden/unfocused sessions keep the idle game loop alive
- Account delete wipes only that account’s store
- Windows build is the MVP; other OS only if isolation is equivalent

## Non-goals

- Site-specific bots, macros, auto-battle
- Proxy / fingerprint / anti-detect
- Mobile
- Reimplementing the game
- Pixel-perfect clone of Idle Labs branding
- License server

## Deliverable expected from you

A working desktop MVP that satisfies isolation + layout + persistence, plus a short written rationale of which runtime you chose and which isolation primitive maps to “one account.” Include how you verified two simultaneous logins on one origin.
