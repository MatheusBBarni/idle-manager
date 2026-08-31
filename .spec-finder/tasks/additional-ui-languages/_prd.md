# Additional UI languages — Product Requirements Document

## Problem

A current Idle manager operator already tiles isolated accounts of one game, starts and stops panels, and sometimes confirms wiping a session or deleting an account.
That shell chrome exists only in Portuguese and English.
Settings offers two language buttons.
New workspaces default to Portuguese.
Unknown saved languages collapse to Portuguese.
Game pages stay in the game’s own language because they are the game site, not the shell.

If the operator’s working language is Spanish or Simplified Chinese, they can still log into games.
They cannot read chrome, and they especially cannot read wipe, delete, and clear-session confirms, in that language.
Misreading a confirm can wipe a session they meant to keep.
There is no locale telemetry, so frequency is unknown.
This is worth solving now because those confirms already ship, and because Spanish and Simplified Chinese were chosen as chrome languages for people who already use the app, not as a marketing-site expansion.

Primary user: current operator who already runs isolated accounts and whose working language is not PT or EN.
Secondary: operators who stay on Portuguese or English keep that chrome.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Chrome locale is only `pt` or `en`; Settings has two language buttons | `src/shared/types.ts`, `src/renderer/src/components/Dialogs.tsx` | 2026-08-31 | High | V1 adds languages to this picker, not a new surface |
| Repository | New workspaces default to Portuguese; unknown locale becomes Portuguese | `src/shared/workspace.ts` | 2026-08-31 | High | Do not change first-launch default in this packet |
| Repository | Game views are isolated site documents, not chrome | `AGENTS.md` | 2026-08-31 | High | Translating chrome does not translate the game |
| Repository | Public site is PT+EN; player-page ADR locked that | `site/astro.config.mjs`, product-website ADR-002 | 2026-08-30 | High | Site copy stays out |
| External | Ethnologue 2026: Mandarin ~1,183M total speakers, Spanish ~561M; “Chinese” is not always one variety | [Wikipedia speakers list](https://en.wikipedia.org/wiki/List_of_languages_by_total_number_of_speakers) | 2026-08-21 | Medium | Supports choosing Simplified Chinese as a distinct locale; does not prove app demand |
| External | Steam splits Simplified/Traditional Chinese and Spain/LatAm Spanish | [Steam languages](https://partner.steamgames.com/doc/store/localization/languages) | 2026-08-31 | High | V1 keeps one Spanish and Simplified only; do not silently invent four locales |
| External | Page language must be programmatically determined | [WCAG 2.2 SC 3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | 2026-08-31 | High | Switching chrome language must also switch the announced page language |
| Inference | Misread wipe/delete is the costly failure; adoption share is unknown | No locale telemetry; confirms exist in `src/shared/i18n.ts` | 2026-08-31 | Medium | Success is a readability checklist, not an adoption percentage |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | An existing workspace can show complete chrome, including wipe/delete/clear-session confirms, in Spanish | Unknown; Spanish chrome does not exist. Measure by the same checklist used at ship. | 100% of chrome strings in Spanish on that pass, including destructive confirms | Manual checklist on a workspace that already has tabs and accounts | First release that offers Spanish |
| G-02 | The same workspace can show complete chrome, including those confirms, in Simplified Chinese | Unknown; Simplified Chinese chrome does not exist. Measure by the same checklist. | 100% of chrome strings in Simplified Chinese on that pass, including destructive confirms | Manual checklist on that workspace | First release that offers Simplified Chinese (same V1 as G-01) |
| G-03 | Portuguese and English chrome still match current copy after the new languages ship | Current PT and EN strings in `src/shared/i18n.ts` | No PT or EN chrome string changes on the checklist except new language names needed to point at the new choices | Same manual checklist, PT and EN passes | Same release as G-01 and G-02 |
| G-04 | Switching chrome language does not start, stop, or wipe isolated sessions | Sessions already persist across chrome locale changes today (PT↔EN) | After switching to Spanish or Simplified Chinese and back, accounts and panels are in the same running/closed state and are not wiped | Manual: switch language on a workspace with at least one running and one closed account | Same release |

G-01 and G-02 share one V1 release ([ADR-001](adrs/adr-001.md)).
A language is not offered in Settings if its checklist fails.

## Out of Scope

- **Public site, landing locales, and README languages** — Need is in-app chrome. Reconsider only with a product-website decision that reopens ADR-002.
- **Game documents and in-page translation** — Games are third-party sites. Reconsider never as a shell feature; operators already have the game’s own language and OS/browser translation.
- **OS-language auto-pick** — New workspaces stay Portuguese. Reconsider if first-run failure is evidenced after G-01/G-02.
- **Rewriting operator-typed tab and account names** — Those are the operator’s labels. Reconsider never for V1.
- **Traditional Chinese** — V1 is Simplified only. Reconsider when Traditional readers are evidenced after G-02.
- **A second Spanish locale (Spain vs Latin America)** — V1 is one Spanish. Reconsider if operators cannot share that copy after G-01.
- **Other languages** — Out until a later packet. Reconsider when another working language is evidenced.
- **Locale telemetry, cloud language packs, community translation UI** — Local app, no remote API. Reconsider only with an explicit measurement or contribution product.
- **Gameplay automation, bots, proxies, fingerprint, anti-detect** — Product prohibition. No trigger to add them.

## In Scope (MVP)

Selected approach: **complete Spanish and Simplified Chinese chrome in one V1**.
Gives up shipping Spanish sooner than Chinese, site localization, auto-detect, and Traditional Chinese.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | Complete Spanish chrome | Spanish-working operators can operate the shell | G-01, US-01, US-03, US-06 | Every chrome string, including confirms, is Spanish when Spanish is selected |
| F-02 | Complete Simplified Chinese chrome | Chinese-working operators can operate the shell | G-02, US-02, US-03, US-06 | Every chrome string, including confirms, is Simplified Chinese when that locale is selected |
| F-03 | Settings language choices for those locales, named in their own language | Operator can pick without guessing codes | G-01, G-02, US-01, US-02 | Settings shows Portuguese, English, Spanish, and Simplified Chinese; current choice is visible |
| F-04 | Page language follows the selected chrome language | Assistive tech and browser language features match chrome | G-01, G-02, US-07 | After a switch, the chrome document language is the selected language |
| F-05 | PT and EN remain selectable and unchanged | Existing operators are not migrated | G-03, US-04 | PT and EN still work and still match current copy |
| F-06 | Language switch leaves sessions alone | Isolation and running panels are not a language side effect | G-04, US-05 | Accounts are not started, stopped, or wiped by changing language |
| F-07 | App-generated default account names follow the selected language | New accounts are not forced into PT/EN labels | G-01, G-02, US-08 | A new account created with no typed name gets a Spanish or Simplified Chinese default when that locale is selected |

## User Stories

### US-01: Switch chrome to Spanish

- **Persona:** Current operator
- **Story:** As an operator whose working language is Spanish, I want to pick Spanish in Settings, so that chrome is readable.
- **Acceptance:**
  - **Given** I have an existing workspace on Portuguese or English
  - **When** I choose Spanish in Settings
  - **Then** chrome labels, empty states, and Settings itself are in Spanish
  - **Given** Spanish is selected
  - **When** I open Settings again
  - **Then** Spanish is shown as the current language

### US-02: Switch chrome to Simplified Chinese

- **Persona:** Current operator
- **Story:** As an operator whose working language is Simplified Chinese, I want to pick Simplified Chinese in Settings, so that chrome is readable.
- **Acceptance:**
  - **Given** I have an existing workspace on Portuguese or English
  - **When** I choose Simplified Chinese in Settings
  - **Then** chrome labels, empty states, and Settings itself are in Simplified Chinese
  - **Given** Simplified Chinese is selected
  - **When** I open Settings again
  - **Then** Simplified Chinese is shown as the current language

### US-03: Destructive confirms match chrome language

- **Persona:** Current operator
- **Story:** As an operator, I want wipe, delete-account, and delete-tab confirms in the language I selected, so that I do not destroy a session by misreading the prompt.
- **Acceptance:**
  - **Given** Spanish or Simplified Chinese is selected
  - **When** I trigger delete account, clear session, or delete tab
  - **Then** the confirm copy is in that language and is not the Portuguese or English text
  - **Given** I cancel the confirm
  - **When** the dialog closes
  - **Then** the account or tab is still there

### US-04: Portuguese and English still work

- **Persona:** Current operator on PT or EN
- **Story:** As an operator who already uses Portuguese or English, I want those languages unchanged, so that this work does not move me.
- **Acceptance:**
  - **Given** I am on Portuguese or English
  - **When** the new languages ship
  - **Then** I can still select PT or EN and chrome matches today’s copy
  - **Given** I switched to Spanish or Simplified Chinese
  - **When** I switch back to Portuguese or English
  - **Then** chrome returns to that language

### US-05: Language change does not wipe sessions

- **Persona:** Current operator
- **Story:** As an operator, I want changing language to leave accounts and panels alone, so that readability is not paid for with a logout.
- **Acceptance:**
  - **Given** at least one running account and one closed account
  - **When** I switch chrome language
  - **Then** running/closed state is unchanged and no session is cleared
  - **Given** I typed tab or account names
  - **When** I switch language
  - **Then** those names are still exactly what I typed

### US-06: Empty workspace chrome follows language

- **Persona:** Current operator
- **Story:** As an operator with no running panels, I want empty-state chrome in my language, so that I am not dropped into PT/EN when nothing is tiled.
- **Acceptance:**
  - **Given** Spanish or Simplified Chinese is selected and no panels are running
  - **When** I look at the stage empty state
  - **Then** that empty copy is in the selected language

### US-07: Announced language matches chrome

- **Persona:** Current operator using assistive tech or browser language features
- **Story:** As an operator, I want the chrome document language to match the language I picked, so that speech and language tools are not stuck on Portuguese or English.
- **Acceptance:**
  - **Given** I select Spanish or Simplified Chinese
  - **When** chrome has applied the language
  - **Then** the chrome document language is that language, not leftover `pt-BR` or `en`

### US-08: Default new account name follows language

- **Persona:** Current operator
- **Story:** As an operator, I want an app-generated account name to match chrome language when I did not type one, so that new rows are not English or Portuguese while the rest of chrome is not.
- **Acceptance:**
  - **Given** Spanish or Simplified Chinese is selected
  - **When** I create an account without typing a name
  - **Then** the default name is in that language
  - **Given** I typed a name
  - **When** I create the account
  - **Then** the typed name is kept

## Constraints

- Isolation, partitions, and session wipe rules do not change because language changed.
- Chrome language never translates the game document.
- V1 is one Spanish locale, not Spain and Latin America as two choices.
- Spanish copy must stay readable for both Spain and Latin America operators rather than using slang that locks it to one region.
- V1 Simplified Chinese is not Traditional Chinese; the picker must not label it only “Chinese” if that hides the script.
- No extra tracking is required to declare G-01 through G-04 done.
- Windows remains the primary packaging target; language behavior is the same on macOS and Linux.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| A language ships with empty or English leftover strings | PT/EN tests already require non-shared keys to differ | Medium / High | Do not offer the language until G-01 or G-02 checklist is green | Hide the language if the pass fails |
| Operators think the game will switch language | Game views are third-party sites | Medium / Medium | Out of scope stays explicit; no in-game translation control | Reconsider only if that confusion blocks G-01/G-02 |
| One Spanish locale reads as Spain-only or LatAm-only | Steam splits es and es-419 | Low / Medium | One readable Spanish; split later if G-01 feedback says it is unusable | New packet if a second Spanish is evidenced |
| Traditional Chinese operators see Simplified and bounce | Steam and Wikipedia treat the scripts as distinct | Medium / Medium | Label Simplified Chinese clearly; Traditional is out of V1 | Reconsider after G-02 if that gap is evidenced |
| PT/EN copy is rewritten while adding keys | G-03 requires current PT/EN | Low / High | Checklist includes PT and EN regression | Block the release if PT/EN drift |

## Architecture Decision Records

- [ADR-001: Complete Spanish and Simplified Chinese chrome in one V1](adrs/adr-001.md) — One release, full chrome dictionaries, Settings picker, no site or auto-detect.

## Open Questions

- Non-blocking: who among operators will do the native-read pass for Spanish and Simplified Chinese confirms before the checklist is signed.
- Non-blocking: exact default account name wording in each new language (must be in-language; wording can be chosen at implementation as long as US-08 holds).
