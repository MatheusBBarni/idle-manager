# In-app update without reinstall

## Overview

- **Problem:** Getting a new Idle manager version today means downloading an installer and shutting down a live tiled farm of isolated accounts.
- **Primary user:** A multi-account operator, mid-session.
- **Value:** On Windows, obtain the new version while the app is running and apply it on a restart the operator chooses. Accounts and layout survive. No separate installer hunt.
- **Selected V1 direction:** Hybrid — Windows operator-timed obtain+apply, with **Authenticode as a V1 gate**. Do not disable publisher-signature checks. macOS/Linux stay on the installer. This is a **quick win**, not a release platform.

## Problem

Idle manager is an Electron desktop shell: many isolated accounts of the same origin in one window (`AGENTS.md`). Closing the process tears down every live `WebContentsView` even though Chromium partitions and workspace JSON already survive a normal restart (`src/main/persistence.ts`).

**Trigger:** a GitHub Release (`v0.1.0`, `v0.2.0` on 2026-08-30). **Current workaround:** quit everything, download `idle-manager-*-win-x64.exe` (or dmg/AppImage), run the NSIS wizard (`oneClick: false`), reopen, wait for N games to reload. **Why insufficient:** the hunt and wizard are extra; the expensive part is the mandatory full shutdown at a time the operator did not choose. Notify-then-installer was rejected as V1 because it still forces that path.

Frequency after 0.2.0 is **unknown** (two tags, one day, is not a cadence).

### Evidence

| Kind | Finding | Source | Date | Confidence |
|---|---|---|---|---|
| Repository | No updater client; version is status-bar only | `package.json`, `src/main/index.ts`, `StatusBar.tsx` | 2026-08-30 | High |
| Repository | CI `--publish never`; releases have installers + `SHA256SUMS.txt` only, no `latest.yml` | `.github/workflows/release.yml`; GitHub Releases API | 2026-08-30 | High |
| Repository | Unsigned NSIS/DMG; mac DMG-only `identity: null` | `electron-builder.yml`; README Releasing | 2026-08-30 | High |
| Repository | Workspace + partitions survive a clean restart if `userData` is not wiped | `persistence.ts`, `AGENTS.md` | 2026-08-30 | High |
| Repository | Modals already hide game views via `overlayOpen` | `Stage.tsx` | 2026-08-30 | High |
| Repository | Public repo, 1 star, 0 forks, 2 releases | GitHub API `MatheusBBarni/idle-manager` | 2026-08-30 | High |
| External | NSIS/AppImage/DMG are auto-updatable via electron-updater; macOS must be signed; zip needed for `latest-mac.yml` | [electron-builder auto-update](https://www.electron.build/docs/features/auto-update) | 2026-08-30 | High |
| External | Operator-timed Restart vs Later is the documented Electron pattern; `quitAndInstall` quits all windows | [Electron updates](https://www.electronjs.org/docs/latest/tutorial/updates) | 2026-08-30 | High |
| External | Windows `verifyUpdateCodeSignature` defaults true | electron-builder `winOptions.ts` via Context7 | 2026-08-30 | High |
| External | Apple Developer Program 99 USD/year | [Apple membership](https://developer.apple.com/support/compare-memberships/) | 2026-08-30 | High |
| External | Azure Artifact Signing needs a paid Azure subscription; exact monthly price unknown | [Microsoft Learn FAQ](https://learn.microsoft.com/en-us/azure/trusted-signing/faq) | 2026-08-30 | Medium |
| External | VS Code auto-updates on macOS/Windows by default (table stakes, not demand proof) | [VS Code FAQ](https://code.visualstudio.com/docs/supporting/faq) | 2026-08-30 | Medium |
| Inference | Current CI would leave any client with nothing to install | `--publish never` + missing metadata on v0.1.0/v0.2.0 | 2026-08-30 | High |
| Inference | Unsigned in-app apply is a new execute channel vs browser+SmartScreen first install | Security/devil Pass 2 | 2026-08-30 | Medium |
| User decision | Pain, mid-session operator, operator-timed V1, quick win, Hybrid direction | Clarification + ADR-001 | 2026-08-30 | High |

## Target Users

| Persona | Context | Need | Current workaround |
|---|---|---|---|
| Multi-account operator (primary) | Many tiled accounts running; a release appears mid-session | Get the new Windows build without hunting an installer; choose when the farm restarts | Quit all, download GitHub NSIS, wizard, reopen |
| Publisher / releaser (secondary) | Tags `v*.*.*` and GitHub Actions attach installers | A feed the Windows client can actually consume, signed so publisher checks pass | `--publish never` + manual installer assets |
| macOS / Linux operator (not V1 design center) | Same app, non-primary packaging | Unchanged installer path; no false “update inside the app” claim | GitHub dmg / AppImage |

## Core Features

| ID | Priority | Feature | Observable user value | Evidence |
|---|---|---|---|---|
| F-01 | Critical | Windows operator sees a new version while the farm is still running | No GitHub hunt to learn a build exists | Locked V1; StatusBar already shows `app.getVersion()` |
| F-02 | Critical | New Windows version can download in the background without quitting | Obtain happens before the chosen restart | User V1; electron-updater `autoDownload` / explicit download |
| F-03 | Critical | Apply only when the operator chooses to restart; never auto-quit | Farm is not stolen out from under them | User V1; council consensus; `autoInstallEvent=manual` |
| F-04 | Critical | After that restart, tabs/accounts/layout and login jars are still there | Success bar: survive the restart they picked | `persistence.ts`; partitions; README quit-and-reopen |
| F-05 | Critical | Windows Authenticode is a ship gate; publisher-signature verification stays on | In-app apply does not strip SmartScreen | ADR-001; `verifyUpdateCodeSignature` default |
| F-06 | Critical | Tagged Windows releases publish `latest.yml` (and related NSIS update artifacts) | Client is not a dead button | Current `--publish never`; electron-builder publish docs |
| F-07 | High | Update chrome uses existing overlay hiding (`overlayOpen`) | Game views do not paint through the prompt | `Stage.tsx`; `AGENTS.md` overlay rule |
| F-08 | High | Operator can defer apply after download | Matches “don’t close my farm now” | User mid-session persona |
| F-09 | Medium | macOS/Linux keep the installer path; UI does not claim in-app apply there | No lying empty Apply on unsigned Mac | ADR-001; mac signing required |
| F-10 | Medium | EN + PT copy for available / downloaded / apply / later | Chrome is already bilingual | `src/shared/i18n.ts` |

## KPIs

| ID | KPI | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| KPI-01 | In-app obtain+apply on a signed Windows tagged release | Not possible (no client, no `latest.yml`, unsigned) | 1 successful obtain+apply from a running Windows install without a separate installer | Manual dogfood on a tagged release after Authenticode | First 1–2 signed updater-enabled releases |
| KPI-02 | Accounts + layout survive the chosen restart | unknown | 0 lost workspace metadata / partition logins in dogfood | Compare tab/account ids and login state before vs after | Same window |
| KPI-03 | Operator still chooses the restart | N/A | 0 unsolicited quits from the updater | Dogfood; no notify-and-force-quit as the only path | Same window |
| KPI-04 | Reinstall not required for those Windows releases | 100% of version moves are reinstalls (inference from current distribution) | Windows dogfood skips the GitHub installer for those releases | Qualitative release notes + dogfood | First 2–3 signed releases |
| KPI-05 | Publisher check remains enabled | Default true in electron-builder; not used yet | V1 ships with `verifyUpdateCodeSignature` still true | Config review at ship | At ship |

## Feature Assessment

| Criterion | Score | Evidence-backed rationale |
|---|---|---|
| Impact | Strong | Live farm shutdown is expensive when it happens. Not Must do vs isolation bugs. |
| Reach | Maybe | 1 star, 2 releases; operator count unknown. Windows-only V1. |
| Frequency | Maybe | Cadence after 0.2.0 unknown. |
| Differentiation | Pass | Table stakes (VS Code / Electron docs), not a moat. |
| Defensibility | Pass | Any Electron app can do this. |
| Feasibility | Maybe | Client + GitHub feed are Strong; V1 is gated on paid Windows signing (price unknown). |

## Independent Critique

### Consensus

Windows-first. Operator-timed apply, never auto-restart. No channels/rollback. Current `--publish never` is dead without `latest.yml`. Notify-only is not the chosen V1. Account jars must survive the restart.

### Unresolved Tensions

| Tension | Position A | Position B | Decision consequence |
|---|---|---|---|
| Unsigned in-app execute | Pragmatic + product: GitHub is already first-install trust; disable publisher checks to ship now | Security + devil: that removes SmartScreen and is RCE into every persist jar | **ADR-001:** Authenticode is a V1 gate; do not disable checks |
| Ship chrome now vs defer | Product: 1 star is a scope cap, not a skip | Devil: no cadence, persistence already survives restart, this is pipeline debt | **User Hybrid:** still ship the outcome, but not unsigned apply |
| Notify-only as “quick win” | Pass 1 security | User rejected installer-based notify; Pass 2 security stopped calling it V1 | Notify-only is out of V1, not a substitute |

### Position Evolution and Dissent

- Pragmatic: **held firm** on unsigned apply; conceded SHA256SUMS is not signing.
- Security: **held firm** on no unsigned execute; stopped labeling notify-only as V1.
- Product: **partially conceded** feed-before-chrome and “don’t sell data-loss.”
- Devil: **held firm** do not ship V1 at all until Authenticode + feed. **Dissent kept:** `quitAndInstall` still kills live views; V1 hides the wizard, it does not keep the farm up.

### Recommended Direction

Hybrid (user-selected): Windows operator-timed obtain+apply; Authenticode gate; publish `latest.yml`; mac/Linux installer.

## Opportunity Decision

| Direction | Outcome | Effort | Principal risk | Decision |
|---|---|---|---|---|
| Original unsigned apply | In-app apply now | Small–medium | GitHub compromise → farm RCE | Rejected |
| Essence-first defer | Keep installer | None | Every tag still interrupts the farm | Rejected |
| Hybrid (Authenticode gate) | Same user outcome after signing | Medium | Delay until paid Windows signing | **Selected (user A)** |

Evidence that drove it: council split on unsigned execute; isolation product is the persist jars; electron-builder defaults to publisher verification; user still wanted in-app apply rather than defer.

## Out of Scope (V1)

- **macOS in-app update** — auto-update requires Developer ID + notarization + zip/`latest-mac.yml`; current target is unsigned DMG. Reconsider after Apple Program + a mac ADR.
- **Linux AppImage in-app update** — theoretically supported, not the primary packaging target. Reconsider after Windows dogfood.
- **Staged rollouts, channels, rollback UI** — ambition is a quick win. Reconsider if a bad signed build needs a productized undo.
- **Force-latest / auto-restart / `checkForUpdatesAndNotify` as the only path** — contradicts operator-timed apply.
- **Disabling `verifyUpdateCodeSignature`** — rejected in ADR-001. New ADR required to reopen.
- **Notify-only (toast + traditional installer) as V1** — user rejected it; does not remove the wizard.
- **Zero-interruption hot swap** — `quitAndInstall` still quits; live views die. Not V1.
- **Gameplay automation, proxy, anti-detect** — product out of scope (`AGENTS.md`).

## Architecture Decision Records

- [ADR-001: Windows operator-timed in-app apply, Authenticode as V1 gate](adrs/adr-001.md) — Hybrid direction; unsigned apply and defer-chrome rejected.

## Research Limitations

- Azure Artifact Signing monthly price was not extractable from the public pricing page this session; only “paid subscription required” is sourced.
- Operator count, post-0.2.0 cadence, and per-user vs per-machine NSIS mix are unknown.
- Advisor child runs reported `failed` from runner output plumbing; Pass 1/2 text was complete and used. Pass 2 was fresh-context, not a true resume.
- No market-size or adoption data for this app; VS Code is expectation, not demand.

## Open Questions

- Which Windows signing vendor/account will be used, and at what price?
- Are existing Windows installs per-user or per-machine (UAC on apply)?
- What release cadence should dogfood assume after the first signed updater-enabled tag?
