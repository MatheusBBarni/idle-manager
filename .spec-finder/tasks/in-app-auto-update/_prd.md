# In-app update without reinstall — Product Requirements Document

## Problem

A multi-account operator in Idle manager keeps several isolated game logins tiled in one window. A new app version today is not a chrome action. It is: notice a GitHub Release, quit every live panel, download the Windows installer (or dmg/AppImage), walk the NSIS wizard, reopen, wait for N games to reload.

That fails the job because the expensive part is an **unchosen full shutdown** plus an **installer hunt**, not missing cookies. Workspace metadata and account sessions already survive a clean restart (`persistence.ts`, `AGENTS.md`). The farm still dies because the process dies.

This is worth solving now on **Windows**, the primary packaging target, for operators who already run several accounts mid-session. Casual or macOS/Linux operators keep the existing download path. V1 does not ship until Windows builds are publisher-signed ([ADR-001](adrs/adr-001.md)).

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | No obtain/apply; version is read-only in the status bar | `StatusBar.tsx`, `package.json` | 2026-08-30 | High | V1 must add a ready/apply moment, not another version string |
| Repository | Releases are installers only; publish does not expose an update feed | `.github/workflows/release.yml` | 2026-08-30 | High | In-app Apply is dead until the feed exists |
| Repository | Dialogs hide game panels | `Stage.tsx` | 2026-08-30 | High | Ready notice must not use a covering overlay |
| Repository | Site already says unsigned Windows / SmartScreen is expected | `site/src/content/landing.ts` | 2026-08-30 | High | First signed build is still an installer; no extra site campaign in V1 |
| External | Restart vs Later, not forced quit | [Electron updates](https://www.electronjs.org/docs/latest/tutorial/updates) | 2026-08-30 | High | Apply is operator-timed |
| External | Non-emergency interruptions should be postponable | [WCAG 2.2.4](https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html) | 2026-08-30 | Medium | Later is required; auto-restart is out |
| Inference | Unsigned 0.2.0 cannot in-app apply until one signed install | ADR-001 + current unsigned NSIS | 2026-08-30 | High | Last installer is a known cost, not a V1 website project |
| User decision | Hybrid Authenticode gate; chrome-strip MVP; dogfood success | `_idea.md`, ADR-001, ADR-002 | 2026-08-30 | High | Locks approach |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | Operator obtains and applies a new signed Windows version from inside the running app, without a separate installer | Not possible today | Pass on a real tagged signed release | Dogfood journal | First 1–2 signed updater-enabled releases |
| G-02 | The farm restarts only when the operator chooses Apply | N/A (no updater) | 0 unsolicited quits from the updater | Dogfood journal | Same window |
| G-03 | Tabs, accounts, layout, and logins survive that chosen restart | unknown | 0 lost workspace metadata or partition logins in dogfood | Compare ids and login state before vs after | Same window |
| G-04 | Ready/Apply never covers game panels | Dialogs today do cover panels | Dogfood: Apply/Later usable with the farm still visible | Dogfood journal | Same window |
| G-05 | Publisher identity stays required for in-app apply | Unsigned NSIS ships today | V1 ships only with publisher-signed Windows apply | Config/release review at ship | At ship |

## Out of Scope

- **macOS and Linux in-app apply** — Signing/zip/feed gaps; not primary target. Reconsider after Windows dogfood + a mac/Linux ADR.
- **Blocking restart overlay, Settings “check now,” nag after Later** — Fights mid-session farm. Reconsider only if G-01 fails because nobody notices Apply (ADR-002).
- **Persistent ready signal that stays on screen until Apply** — Rejected. Reconsider with G-01 miss.
- **Failure copy and retry as a ship gate** — Success is obtain+apply, not recover-from-fail. Reconsider if dogfood hits silent failed obtains.
- **Website campaign that 0.2.0 must install once more** — Rejected for V1; existing SmartScreen FAQ stays. Reconsider if cutover confuses operators.
- **Feed-first with no Apply chrome** — Would miss G-01. Reconsider only if signing/feed cannot be paired with chrome.
- **Force-latest, auto-restart, channels, rollback, hot-swap, notify-then-installer as V1** — Cut in `_idea.md`. Reconsider if a bad signed build needs productized undo.
- **Disabling publisher checks to apply unsigned builds** — ADR-001. New ADR required.
- **Gameplay automation, proxy, anti-detect, usage telemetry** — Product prohibition; dogfood only.

## In Scope (MVP)

Selected approach: **chrome-strip MVP after Windows publisher signing exists** ([ADR-002](adrs/adr-002.md)) — background obtain, quiet getting-update, Apply/Later on non-covering chrome, Later hides for the session and may return next launch. Gives up overlay, Settings check, failure copy, mac/Linux hints, and extra website copy.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | Operator can learn a signed Windows version is available while the farm runs | No GitHub hunt | G-01, US-01 | Chrome shows ready + Apply/Later; panels stay visible |
| F-02 | New version can download without quitting | Obtain before the chosen restart | G-01, US-02 | Quiet “getting update”; farm keeps running |
| F-03 | Apply only on operator choice | Farm is not stolen | G-02, US-03 | Apply quits and returns on the new version; nothing else auto-quits |
| F-04 | Chosen restart keeps workspace and logins | Success bar | G-03, US-03 | Same tabs/accounts/layout/logins after Apply |
| F-05 | Later postpones Apply for this session | Mid-session play continues | G-02, G-04, US-04 | Apply hidden until next launch of the same ready version |
| F-06 | Chrome stays version-only when apply is impossible | No fake Apply | G-04, US-05 | Already latest, macOS/Linux, unsigned, or failed obtain: no Apply |
| F-07 | In-app apply only for publisher-signed Windows | Jars are not updated from an unsigned binary | G-05, US-05 | Unsigned/non-Windows builds never show Apply |
| F-08 | EN and PT copy for getting-update / ready / Apply / Later | Chrome is bilingual | US-01–US-04 | Both locales show the same states |

## User Stories

### US-01: See that a version is ready

- **Persona:** Multi-account operator (Windows, signed build)
- **Story:** As an operator, I want to see that a new version is ready without covering the farm, so that I can finish this session.
- **Acceptance:**
  - **Given** a signed Windows install is running and a newer signed version is ready
  - **When** I look at chrome (not a covering dialog)
  - **Then** I see Apply and Later, and game panels stay visible

### US-02: Obtain while running

- **Persona:** Multi-account operator
- **Story:** As an operator, I want the new version to download while accounts stay up, so that I am not sent to GitHub.
- **Acceptance:**
  - **Given** a newer signed Windows version exists
  - **When** it is being obtained
  - **Then** chrome may show a quiet getting-update state and every running account stays running

### US-03: Apply on my restart

- **Persona:** Multi-account operator
- **Story:** As an operator, I want Apply to restart on the new version when I choose, so that I skip the installer wizard.
- **Acceptance:**
  - **Given** a version is ready
  - **When** I choose Apply
  - **Then** the app restarts on that version without a separate installer, and tabs/accounts/layout/logins are still there
  - **Given** a version is ready and I do not choose Apply
  - **When** I keep working
  - **Then** the app does not quit on its own

### US-04: Later this session

- **Persona:** Multi-account operator
- **Story:** As an operator, I want Later to hide Apply for the rest of this session, so that I am not nagged mid-farm.
- **Acceptance:**
  - **Given** Apply/Later is showing
  - **When** I choose Later
  - **Then** Apply is hidden for the rest of this session
  - **Given** I chose Later and then quit and reopen
  - **When** the same version is still ready
  - **Then** Apply/Later may show again

### US-05: Empty and unsupported paths

- **Persona:** Operator on latest, macOS/Linux, unsigned Windows, or a failed obtain
- **Story:** As an operator, I want chrome to stay ordinary unless Apply is actually possible, so that I am not offered a fake update.
- **Acceptance:**
  - **Given** I am already on the latest signed Windows version, or obtain failed
  - **When** I look at chrome
  - **Then** I see the version as today and no Apply
  - **Given** I am on macOS, Linux, or an unsigned Windows build
  - **When** I look at chrome
  - **Then** I see the version as today and no Apply

## Constraints

- Windows is the only V1 apply surface; macOS/Linux keep GitHub/site installers.
- In-app apply requires a publisher-signed Windows build. Unsigned apply is out.
- Ready/Apply/Later must not cover game panels.
- Account isolation and local-only session stores stay unchanged. Updates must not wipe `userData` workspace or account sessions.
- Chrome copy is EN and PT.
- No usage telemetry; success is dogfood.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Signing never purchased; V1 cannot ship | ADR-001; paid signing required | Medium / High | Do not ship unsigned Apply | Publisher; no fallback without new ADR |
| Apply is easy to miss | Strip vs overlay (user A) | Medium / Medium | Dogfood G-01; do not add overlay without ADR | Operator dogfood after first signed tag |
| Failed obtain looks like “no update” | Silent empty path (user A) | Medium / Medium | Out of ship gate; log in dogfood notes | Reconsider failure copy if G-01 fails that way |
| 0.2.0 still needs one signed installer | Current unsigned NSIS + site FAQ | High / Low | Accepted cost; no extra site campaign | Cutover confusion → later copy ADR |
| Per-machine Windows install may block quiet apply | NSIS allows directory change | Unknown / Medium | Open question; TechSpec/ops | If dogfood hits elevation, document or narrow |

## Architecture Decision Records

- [ADR-001: Windows operator-timed in-app apply, Authenticode as V1 gate](adrs/adr-001.md) — Unsigned in-app apply and defer-chrome rejected.
- [ADR-002: Chrome-strip Apply/Later MVP](adrs/adr-002.md) — Website cutover and feed-first rejected.

## Open Questions

- Which Windows signing vendor/account, and at what price? (blocks ship, not PRD approach)
- Are installed Windows copies per-user or per-machine?
- What tag cadence should dogfood assume after the first signed updater-enabled release?
