# Task Memory: task_04

## Objective Snapshot

Privacy copy, MIT LICENSE, GitHub source link on both locales.

## Important Decisions

- Privacy and source body copy stay page-local in `en/index.astro` and `pt/index.astro` (`#privacy`, `#source`). Layout only adds keyboard nav links.
- Mention GitHub Releases API GET now (probe still task_05) so US-05 is true when the fetch lands.
- Root `LICENSE` is MIT with `Copyright (c) 2026 Idle manager` to match `package.json` `license`/`author`. No extra `/license` route.
- No macOS/Linux installer controls.

## Learnings

- Built heads remain charset/viewport/description/title/favicon + same-origin stylesheet; zero `<script>` on EN/PT after this slice.

## Files / Surfaces

- `LICENSE`
- `site/src/layouts/Landing.astro`
- `site/src/pages/en/index.astro`
- `site/src/pages/pt/index.astro`

## Errors / Corrections

## Ready for Next Run

- task_05: add Download + SmartScreen next to the source/download region; do not change picker rules; do not add pixels.
