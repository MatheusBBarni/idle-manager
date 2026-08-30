# Idle manager public home

## Overview

- **Problem:** There is no shareable player page. The only public story is `README.md`, which leads with contributor setup and does not give a Windows installer.
- **Primary user:** Multi-account idle players who need to understand isolation vs a bot, then download Windows.
- **Value:** A public URL that states what Idle manager is (and is not) and starts a real Windows download in one visit.
- **Selected V1:** Hybrid (ADR-001) — one static landing page, Windows download CTA live only when a GitHub Release NSIS exists. Compounding capability: same Astro/GitHub Pages tree can add routes later; V1 ships one page.

## Problem

A player who hears about Idle manager today is sent to GitHub. They land on a README that starts with `pnpm install` / `pnpm dev`, architecture, and keyboard shortcuts. Isolation vs bot is in that README, but there is no installer: GitHub `releases: []`, `has_pages: false`, `homepage: null` (API, 2026-08-30). Frequency of this moment is unknown (repo created the same day, 1 star). Workaround: clone, build, or wait. That fails the job of “understand, then download Windows” for someone who is not going to run Electron from source.

### Evidence

| Kind | Finding | Source | Date | Confidence |
|---|---|---|---|---|
| Repository | README is the only public product story; Windows MVP is NSIS via `pnpm dist` | `README.md`, `electron-builder.yml` | 2026-08-30 | High |
| Repository | Isolation is `persist:opsource-account-{id}`; not a bot/proxy/fingerprint product | `src/shared/partition.ts`, `AGENTS.md`, README Privacy | 2026-08-30 | High |
| Repository | No website package, no Pages workflow, no marketing screenshots | repo layout; `assets/icon.png` only | 2026-08-30 | High |
| External | Public repo, no homepage, no Pages, no Releases, 1 star, created 2026-08-30 | GitHub API `MatheusBBarni/idle-manager` | 2026-08-30 | High |
| External | Pages hosts static sites; project URL `https://<owner>.github.io/<repo>/` | [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) | 2026-08-30 | High |
| External | Site ≤ 1 GB; soft 100 GB bandwidth/month; not for commercial SaaS | [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) | 2026-08-30 | High |
| External | Astro on Pages is prerendered; set `site` + `base` | [Deploy Astro to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) | 2026-08-30 | High |
| External | Releases are for packaging binaries | [About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) | 2026-08-30 | High |
| External | Ghost Browser / SessionBox / Wavebox occupy “many accounts, one window”; SessionBox leans automation | competitor homepages | 2026-08-30 | High |
| Inference | A live Download button with empty Releases fails the 30-day success test | council + GitHub API | 2026-08-30 | High |
| Inference | Hosting the NSIS on Pages fights size/bandwidth limits; Releases are the binary channel | Pages limits + Releases docs | 2026-08-30 | Medium |

## Target Users

| Persona | Context | Need | Current workaround |
|---|---|---|---|
| Multi-account idle player (primary) | Already runs several idle-game logins; sent a link or finds the product | Know it is not a bot/anti-detect tool; get Windows in one visit | README + clone/build, or nothing |
| Sharer (secondary) | Wants a clean URL for a player | Something other than a contributor README | GitHub repo URL |
| Contributor (not V1) | Already on the repo | Dev setup, architecture | README — keep it; do not replace with the landing |

## Core Features

| ID | Priority | Feature | Observable user value | Evidence |
|---|---|---|---|---|
| F-01 | Critical | One public landing: what Idle manager is | Player can understand the product without `pnpm` | User V1 = one page; README is contributor-facing |
| F-02 | Critical | Isolation vs bot copy near the hero (not a bot, macro, cheat injector, fingerprint, proxy, or shared jar) | Distinguishes from Ghost/SessionBox-style tools | `AGENTS.md`, README Privacy; competitor homepages 2026-08-30 |
| F-03 | Critical | Windows download CTA **gated** on a real GitHub Release NSIS | First-visit download is possible only when the file exists | GitHub `releases: []`; ADR-001 |
| F-04 | High | CTA points at same-repo Releases, not Pages-hosted binaries | Installer uses GitHub’s binary channel | Releases docs; Pages 1 GB / 100 GB limits |
| F-05 | High | Unsigned / SmartScreen / unknown-publisher warning next to Download | Honest download trust | `electron-builder.yml` has no Authenticode; trust advisor |
| F-06 | High | Privacy link: app (local partitions, no cookie export) vs site (GitHub Pages IP logs; no extra pixels) | Claim matches README; site is not a tracker | README Privacy; GitHub Pages data-collection note |
| F-07 | Medium | Source + license links (GitHub repo, MIT as in `package.json`) | Provenance | `package.json` MIT; GitHub `license` field still null |
| F-08 | Medium | Static tree that can add routes later; V1 ships one route | Matches compounding ambition without extra pages | User ambition C; Astro Pages deploy guide |

## KPIs

| ID | KPI | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| KPI-01 | Public home loads with isolation-vs-bot visible without hunting | No Pages site (`has_pages: false`) | URL live; claim in hero or next block | Manual checklist | Launch |
| KPI-02 | First-visit Windows download start | unknown (0 Release assets) | A new visitor can start an installer download in one visit | Button → GitHub Release asset; Release download counts | 30 days after live CTA |
| KPI-03 | Live CTA points at a real installer | 0 Release assets | ≥1 Windows NSIS (or equivalent) on same-repo Releases | Release API / button URL | Before enabling Download |
| KPI-04 | No third-party analytics pixels on V1 | none | Zero extra trackers | Page source checklist | Launch |
| KPI-05 | Dead-download visits | n/a | Download control hidden or disabled until KPI-03 | Manual / release gate | Until first Release |

## Feature Assessment

| Criterion | Score | Evidence-backed rationale |
|---|---|---|
| Impact | Strong | Missing conversion surface vs README; **gated** on a Release (council: Impact overstated until the file exists) |
| Reach | Maybe | 1 star, repo created 2026-08-30; a site does not create visitors |
| Frequency | Maybe | Discovery/download, not a daily loop; compounding is later docs on the same tree |
| Differentiation | Strong (product) / Maybe (site) | Idle isolation + anti-bot is the wedge; a landing page is commodity |
| Defensibility | Pass | Anyone can ship a static page; the moat is the Electron partition product |
| Feasibility | Strong (page) / blocked (KPI-02 until Release) | Astro+Pages is documented and in-quota for a public repo; download success needs an NSIS asset |

## Independent Critique

Five delegated advisors (engineering, architecture, product, devil’s advocate, privacy/trust), two rounds. Host run status showed `failed` after several produced text (extension timer); openings and rebuttals were captured from their output.

### Consensus

- Do not put a live Download on empty Releases.
- Host the installer on GitHub Releases, not Pages.
- No gallery/FAQ/docs in V1.
- No third-party analytics pixels.
- Copy must match README / AGENTS.md (not a bot; local sessions).
- Unsigned NSIS needs an honest SmartScreen warning.

### Unresolved Tensions

| Tension | Position A | Position B | Decision consequence |
|---|---|---|---|
| Build a site at all? | Product (after rebuttal): one-pager is V1 scope | Devil: unjustified until visitors will hit Pages instead of the Release page | User chose Hybrid: site yes, CTA gated |
| Sequence | Eng: Release before or with the page; no live CTA until the `.exe` exists | Product: same-slice OK; do not drop the page | ADR-001: same-slice allowed; live CTA gated |
| Foundation vs essence | Arch: Astro/Pages tree for later static routes | Devil: scaffolding for deferred docs | User ambition C + Hybrid: one route now, tree may grow |

### Position Evolution and Dissent

- **Eng:** Opening Release-first → **partially concede** parallel thin shell, no live CTA until asset.
- **Arch:** Opening binaries-on-Releases → **partially concede** ship-gate; **hold** option-1 topology.
- **Product:** Opening “don’t build the site as the next bet” → **partially concede** keep the one-pager, gate the button.
- **Devil:** Opening don’t build → **partially concede** Release is a hard dep; **hold** that a separate page still needs a reason visitors use Pages.
- **Trust:** Opening bounded trust claim → **partially concede** don’t block V1 on code signing; **hold** privacy copy, same-repo asset, no pixels.

**Dissent (preserved):** Devil’s advocate still rejects a one-pager until there is evidence people will use Pages rather than the repo/Release page.

### Recommended Direction

Hybrid: one landing + gated Windows download. Principal cost: installer packaging is on the critical path.

## Opportunity Decision

| Direction | Outcome | Effort | Principal risk | Decision |
|---|---|---|---|---|
| Hybrid: page + gated download | Shareable player home; download only when real | Page small; Release medium | Installer delays the 30-day KPI | **Selected (user A)** |
| Original: ship page now | URL exists even if Releases empty | Small | Dead download / vanity funnel | Rejected |
| Essence: Release + README only | Download without a site | Smaller | No player home; README stays `pnpm` | Rejected |
| Ambitious: gallery + FAQ now | Broader marketing site | Larger | No screenshots; V1 was one page | Rejected |

Driver: user Hybrid choice after critique; GitHub `releases: []`; Pages vs Releases docs.

## Out of Scope (V1)

- **Docs, changelog, extra routes** — User scoped V1 to one page; tree may grow later.
- **Screenshot / video gallery** — Only `assets/icon.png` exists; user rejected gallery+FAQ.
- **PT/EN site localization** — User rejected a localized hub; in-app is already PT/EN.
- **macOS / Linux as primary download** — Windows is MVP (`electron-builder.yml`, README).
- **Hosting the installer on Pages** — Size/bandwidth limits; Releases are for binaries.
- **Third-party analytics / ads pixels** — Contradicts local-sessions story; Pages has no product analytics.
- **Custom domain** — Unknown; not required for V1 project site.
- **Authenticode / signed publisher** — Not in builder config; warning instead of fake trust.
- **Gameplay, bots, proxies, fingerprint, anti-detect** — Product out of scope (`AGENTS.md`).

## Architecture Decision Records

- [ADR-001: Hybrid public home with gated Windows download](adrs/adr-001.md) — One Astro/Pages landing; live Windows CTA only after a same-repo Release NSIS; binaries not on Pages.

## Research Limitations

- Demand/traffic unknown (new 1-star repo). Do not treat that as zero demand.
- No published installer at research time; KPI-02 is blocked until one exists.
- Competitor homepages are positioning, not idle-game market size.
- GitHub Pages does not provide product analytics; 30-day download measurement is Release-side, not page-side.
- Several council child runs were marked failed after producing text (host extension timer); arguments above are from captured output, not simulated advisors.

## Open Questions

- Project-site path (`https://matheusbarni.github.io/idle-manager/`) vs a later custom domain.
- When the first Windows Release will exist relative to first Pages publish.
- Whether GitHub’s repo `license` field will be set to MIT before launch (public-story mismatch).
- English-only V1 copy vs later PT (deferred, not decided as never).
