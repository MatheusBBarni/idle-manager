# Task Memory: task_03

## Objective Snapshot

Portuguese landing, locale `<a>` links, `/` redirect to `/en/`.

## Important Decisions

- Used Astro i18n with `locales: ['en','pt']`, `defaultLocale: 'en'`, `prefixDefaultLocale: true` (ADR-003). File-based `src/pages/en/` and `src/pages/pt/` kept.
- `redirectToDefaultLocale: false` plus `src/pages/index.astro` `Astro.redirect(getRelativeLocaleUrl('en'))`. Enabling both `redirectToDefaultLocale: true` and an index route warned `Could not render '' from route / as it conflicts with higher priority route /`; the explicit redirect still emits `dist/index.html` → `/idle-manager/en/`.
- Locale switch is `getRelativeLocaleUrl` `<a>` links (includes `base`), not client storage. No Accept-Language.
- Context7 MCP tools were not available; i18n config taken from current Astro docs (`withastro/docs` internationalization + configuration-reference).

## Learnings

- With `prefixDefaultLocale: true`, Astro still requires `src/pages/index.astro`. Empty index + `redirectToDefaultLocale: true` both own `/` and warn in static build.

## Files / Surfaces

- `site/astro.config.mjs` — i18n
- `site/src/pages/pt/index.astro` — Portuguese isolation copy
- `site/src/pages/index.astro` — root → `/en/`
- `site/src/layouts/Landing.astro` — locale `<a>` + localized chrome strings

## Errors / Corrections

- First build with empty index + `redirectToDefaultLocale: true` succeeded but warned. Switched to explicit `Astro.redirect`.

## Ready for Next Run

- Privacy/source (task_04) and Download probe (task_05) extend this layout and both locale pages. Do not change picker rules.
