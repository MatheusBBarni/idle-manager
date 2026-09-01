# Task Memory: task_03

## Objective Snapshot

- Ship `{base}/en/keyboard/` and `{base}/pt/keyboard/` docs pages; landing nav link only.

## Important Decisions

- Not a Keyboard section on `Landing.astro`. Copy lives in `site/src/content/keyboard.ts`.
- Landing Keyboard link sits in chrome-end (visible on small screens where `.page-nav` is hidden).
- Docs pages use `layouts/Keyboard.astro` with skip link, locale switch, and home link back to the landing.

## Learnings

- Astro 7 build emits `site/dist/en/keyboard/index.html` and `site/dist/pt/keyboard/index.html` (`trailingSlash: always`). Public URLs include `base`: `/idle-manager/en/keyboard/` and `/idle-manager/pt/keyboard/`.

## Files / Surfaces

- `site/src/content/keyboard.ts`, `site/src/content/keyboard.copy.test.ts`
- `site/src/layouts/Keyboard.astro`
- `site/src/pages/en/keyboard.astro`, `site/src/pages/pt/keyboard.astro`
- `site/src/content/landing.ts` (nav label only)
- `site/src/layouts/Landing.astro` (nav link only)
- Electron `src/` untouched

## Errors / Corrections

## Ready for Next Run

- Four surfaces to keep in sync: matcher, Settings, README, docs pages.
