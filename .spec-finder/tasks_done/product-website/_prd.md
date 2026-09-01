# Idle manager public home — Product Requirements Document

## Problem

A multi-account idle player who is sent a link today lands on GitHub. The current workflow is: open `README.md`, skim architecture and `pnpm install` / `pnpm dev`, and look for a Windows installer. That fails in two ways. First, the README is a contributor path, not a player home. Second, there is nothing to install: GitHub still has no Releases (`releases: []`, API 2026-08-30). Isolation vs a bot is already written in the README Privacy warning, but the player cannot complete “understand, then download Windows” without cloning and building.

This is worth solving now because the product’s only public face trains visitors as developers and cannot convert a Windows player. Traffic is unknown (repo created 2026-08-30, 1 star); the cost of waiting is not lost scale, it is a shareable story that still dumps people into `pnpm`.

Primary user: multi-account idle player. Secondary: someone sharing a clean URL. Contributors keep the README; this page does not replace it.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | README leads with install-from-source; Privacy warning already says not a bot | `README.md` | 2026-08-30 | High | Player page must not be another `pnpm` guide |
| Repository | Windows MVP is NSIS; no publisher signing in packaging config | `electron-builder.yml` | 2026-08-30 | High | Download must warn about unknown publisher / SmartScreen |
| Repository | Isolation is per-account persist partitions; no bots/proxies/fingerprints | `src/shared/partition.ts`, `AGENTS.md` | 2026-08-30 | High | Hero claim is isolation vs bot, not stealth |
| External | No homepage, no Pages, no Releases, 1 star | GitHub API `MatheusBBarni/idle-manager` | 2026-08-30 | High | Live Download is invalid until a Release exists |
| External | SmartScreen warns on files without reputation | [Microsoft SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/) | 2026-08-30 | High | Unsigned warning is in-scope copy, not polish |
| External | Hosted project sites log visitor IPs for security | [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) | 2026-08-30 | High | Privacy copy covers the site, not only the app |
| Inference | A Download button to empty Releases fails first-visit success | GitHub API + ADR-001 | 2026-08-30 | High | Withhold Download until a real installer exists |
| User decision | Dual-state one page; PT+EN; source for non-Windows; keyboard-usable | ADR-002 | 2026-08-30 | High | Locks V1 approach and overrides idea’s EN-only exclusion |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | A player can read what Idle manager is and that it is not a bot without using GitHub’s README | No public player page (`has_pages: false`) | Isolation-vs-bot claim visible in the first screen of content in PT and EN | Manual checklist on the live URL | At first public publish |
| G-02 | A Windows player can start an installer download in one visit | unknown; 0 Release assets; measure via GitHub Release download counts once Download is live | Download control starts a same-project Release installer in one visit | Click the live Download; confirm Release asset download | 30 days after Download is enabled |
| G-03 | Nobody is offered a working Download before an installer exists | 0 Release assets | Download absent or clearly unavailable; not a dead file link | Manual check of the public page | From first publish until G-02 enablement |
| G-04 | The page does not add third-party tracking pixels | none | Zero extra trackers | View page source / network on a first visit | At publish and at Download enablement |
| G-05 | A visitor who cannot use a mouse can still read the claim and reach Download or GitHub/source | unknown | Keyboard can move through the page and activate the offered controls | Manual keyboard pass | At publish |

G-02’s clock starts when Download becomes live (ADR-002), not when the page first appears.

## Out of Scope

- **Docs, changelog, extra URLs** — V1 is one player page. Reconsider when G-01 is live and a second job (manual, history) is evidenced.
- **Screenshot / video gallery** — Only `assets/icon.png` exists. Reconsider when there are product shots to show.
- **macOS / Linux installers as a download** — Windows is MVP. Reconsider when those packages are published the same way as Windows.
- **Hosting the installer on the player site** — Binaries belong with GitHub Releases. Reconsider only if Release distribution becomes unusable.
- **Code signing / “known publisher”** — Not in current packaging; V1 warns instead of implying a signed vendor. Reconsider when signing exists.
- **Third-party analytics, ads, or pixels** — Contradicts local-session privacy. Reconsider only with an explicit measurement product decision.
- **Formal public WCAG AA statement** — Keyboard-usable page only. Reconsider if a conformance claim is required.
- **Replacing the GitHub README** — Contributors keep it. Reconsider never for V1.
- **Gameplay automation, bots, proxies, fingerprint, anti-detect** — Product prohibition (`AGENTS.md`). No trigger to add them.

## In Scope (MVP)

Selected approach: **dual-state one page** — public now with Download withheld; Windows Download later when a real installer exists; PT and EN; GitHub/source for non-Windows. Gives up treating “page published” as “players can install today.”

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | One public player page stating what the product is | Understand without `pnpm` | G-01, US-01 | First screen of content names Idle manager as a local multi-account shell |
| F-02 | Isolation vs bot claim (not bot, macro, cheat, fingerprint, proxy, or shared jar) | Trust vs Ghost/SessionBox-like tools | G-01, US-01 | Claim is readable without opening README |
| F-03 | Download withheld until a real Windows installer exists | No fake install | G-03, US-02 | No working Download control, or it is clearly unavailable |
| F-04 | Windows Download to same-project GitHub Release when installer exists | First-visit install start | G-02, US-03 | Control starts that installer download |
| F-05 | Unsigned / unknown-publisher / SmartScreen warning with Download | Honest OS risk | G-02, US-03 | Warning visible with the live Download |
| F-06 | GitHub/source path for non-Windows (and provenance) | No fake Mac/Linux install | US-04 | Non-Windows visitors can open source; no other-OS installer button |
| F-07 | Privacy copy: app local sessions vs site host IP logs; no extra pixels | Claim matches product | G-04, US-05 | Privacy text is on the page; no third-party pixels |
| F-08 | Portuguese and English copy on the same page | Both in-app languages | G-01, US-06 | Same claims available in PT and EN |
| F-09 | Keyboard use, text for meaningful images, usable contrast | Complete the visit without a mouse | G-05, US-07 | Keyboard can reach offered controls |

## User Stories

### US-01: Understand isolation vs bot

- **Persona:** Multi-account idle player
- **Story:** As a player, I want to see that this is a local isolated-session shell and not a bot, so that I can decide to trust it.
- **Acceptance:**
  - **Given** I open the public player URL
  - **When** I view the first screen of content
  - **Then** I can tell what Idle manager is and that it does not automate play, inject cheats, spoof fingerprints, use proxies, or share one cookie jar

### US-02: No download before an installer exists

- **Persona:** Multi-account idle player
- **Story:** As a player, I want the page not to pretend I can install, so that I do not hit a dead file.
- **Acceptance:**
  - **Given** no Windows installer has been published on the project’s GitHub Releases
  - **When** I look for Download
  - **Then** I am not offered a working download, and I can still read the isolation claim
  - **Given** I am on Windows in that state
  - **When** I look for another way to get the app
  - **Then** I may use GitHub/source; I am not told to `pnpm dev` as the player path

### US-03: Start Windows download when it exists

- **Persona:** Multi-account idle player
- **Story:** As a Windows player, I want to start the installer in the same visit, so that I do not have to build from source.
- **Acceptance:**
  - **Given** a Windows installer exists on the same GitHub project’s Releases and Download is enabled
  - **When** I activate Download
  - **Then** an installer download from that Release starts, and I see that Windows may warn (SmartScreen / unknown publisher)
  - **Given** Download is enabled
  - **When** the Release asset is missing or the link is broken
  - **Then** I am not left with a silent failure that looks like a successful install

### US-04: Non-Windows source path

- **Persona:** Multi-account idle player
- **Story:** As a non-Windows player, I want a source path instead of a fake installer, so that I am not promised macOS/Linux V1.
- **Acceptance:**
  - **Given** I am not on Windows
  - **When** I look for install
  - **Then** I can open GitHub/source and I do not see a macOS or Linux installer button

### US-05: Privacy on the page

- **Persona:** Multi-account idle player
- **Story:** As a player, I want privacy claims that separate the app from the site, so that “nothing leaves the machine” is not a lie about the page.
- **Acceptance:**
  - **Given** I open the player page
  - **When** I read privacy
  - **Then** I see that game sessions stay on the device, and that the public site’s host may log IPs for security, and the visit does not load extra tracking pixels

### US-06: Portuguese and English

- **Persona:** Multi-account idle player
- **Story:** As a player, I want PT and EN, so that I can read the same claims in either language the app already uses.
- **Acceptance:**
  - **Given** I open the player page
  - **When** I switch or view the other language
  - **Then** the isolation, download, and privacy claims are available in Portuguese and in English

### US-07: Without a mouse

- **Persona:** Multi-account idle player
- **Story:** As a player, I want to use the page from the keyboard, so that I can still understand and reach Download or source.
- **Acceptance:**
  - **Given** I cannot use a mouse
  - **When** I move through the page with the keyboard
  - **Then** I can read the isolation claim and activate Download (if live) or GitHub/source
  - **Given** a meaningful image is shown
  - **When** I cannot see it
  - **Then** equivalent text is available

## Constraints

- Copy must match the product: local isolated sessions; not a bot, macro, cheat injector, fingerprint tool, proxy tool, or shared-jar swapper.
- App privacy (on-disk sessions, optional OS encryption of workspace metadata) is not the same as site privacy (host may log IPs). Do not add extra trackers.
- Windows is the only V1 installer. Unsigned builds will face OS warnings; the page must not claim a known publisher.
- GitHub README remains the contributor surface.
- PT and EN must stay aligned; language is not a second product.
- Public web content should be operable and understandable without a mouse (WCAG 2.2 principles; no formal AA claim).

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Visitors bounce because they cannot install yet | `releases: []`; dual-state A | High / medium | Withhold Download; keep isolation readable; enable Download only with a real asset | Revisit if G-03 is violated |
| SmartScreen blocks the installer after Download | Microsoft SmartScreen; unsigned `electron-builder.yml` | High / high | Warning next to Download; do not claim signed | Revisit when signing exists |
| PT/EN drift from README claims | Override of idea exclusion | Medium / high | Same claims both languages; no extra doc routes | Revisit if copies disagree |
| “Local sessions” contradicted by pixels | Pages IP logging; G-04 | Medium / high | No extra trackers; disclose host logs | Fail G-04 if pixels appear |
| Unknown demand | 1 star, new repo | High / low for V1 | Do not invent traffic targets; G-02 uses Release counts | Revisit if a numeric download goal is needed |

## Architecture Decision Records

- [ADR-001: Hybrid public home with gated Windows download](adrs/adr-001.md) — One landing; live Windows CTA only after a real Release installer; binaries not on the player site.
- [ADR-002: Dual-state player page](adrs/adr-002.md) — Page may be public with Download withheld; PT+EN; source for non-Windows; keyboard-usable; G-02 window starts at Download enablement.

## Open Questions

- How the visitor chooses PT vs EN (control vs two views) — TechSpec; both languages are required.
- Exact GitHub project URL vs a later custom domain — not required for V1 behavior.
- Whether the GitHub repo license field will be set to MIT before launch — provenance hygiene, not a page-structure branch.
