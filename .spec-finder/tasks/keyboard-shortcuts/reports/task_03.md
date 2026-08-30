# Task 03 Final Report: Ship PT+EN keyboard docs pages

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` (Pi)

## Changes

- `site/src/content/keyboard.ts` — PT/EN docs copy and the four frozen accelerators
- `site/src/content/keyboard.copy.test.ts` — accelerator substrings; landing has no bind table
- `site/src/layouts/Keyboard.astro` — semantic docs page, skip link, locale switch, home link
- `site/src/pages/en/keyboard.astro`, `site/src/pages/pt/keyboard.astro`
- `site/src/content/landing.ts` — `keyboard` nav label only
- `site/src/layouts/Landing.astro` — chrome link to locale `{base}/…/keyboard/`
- Electron `src/` — unchanged

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Astro pages at `en/keyboard.astro` and `pt/keyboard.astro`; `{base}/en/keyboard/` and `{base}/pt/keyboard/` | satisfied | `pnpm --dir site build` emitted `/en/keyboard/index.html` and `/pt/keyboard/index.html`; landing hrefs `/idle-manager/en/keyboard/` and `/idle-manager/pt/keyboard/` |
| 2. Bind copy in `keyboard.ts`, not a list in `landing.ts` | satisfied | binds only in `keyboard.ts`; landing test forbids `Shift+N` |
| 3. Only the four frozen chords | satisfied | four `binds` rows; copy test requires `Shift+N`, `[`, `]`, `Enter` |
| 4. Landing chrome **link**; MUST NOT render bind list on landing | satisfied | built EN/PT landing HTML has keyboard href, 0× `Shift+N` / `Ctrl+Enter` / `⌘⇧N` |
| 5. Docs pages keyboard-reachable | satisfied | skip link, `<table>`/`<h1>`, locale switch, home `<a href>` to landing |
| 6. `keyboard.copy.test.ts` | satisfied | 2 tests pass |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm --dir site test` | pass | 5 files / 25 tests including `keyboard.copy.test.ts` |
| `pnpm --dir site build` | pass | 5 pages; no `/docs` hub |
| Built EN/PT keyboard HTML includes four binds | pass | each of `Shift+N`, `Shift+[`, `Shift+]`, `Ctrl+Enter` count 1 |
| Built landing links to locale keyboard path, no bind list | pass | href `/idle-manager/en/keyboard/` / `/idle-manager/pt/keyboard/`; no chord table |
| Electron `src/` untouched | pass | no `src/` diff in this task |

## Risks and Follow-ups

- Four surfaces (matcher, Settings, README, docs pages) can drift if chords change.
- product-website PRD still says “no extra URLs”; ADR-004 is the override for this one path per locale.

## Final Verdict

task_03 is completed: shareable PT and EN keyboard docs pages list the four frozen accelerators, the landing only links to them, site tests and build passed, and the Electron tree was not modified.
