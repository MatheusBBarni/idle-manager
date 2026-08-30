# Task Memory: task_05

## Objective Snapshot

Wire always-on Download (fallback href) plus one unauthenticated Releases GET that applies `selectWindowsDownload`, with SmartScreen copy on EN and PT.

## Important Decisions

- Download control and SmartScreen copy live in `Landing.astro` (localized), after the page slot, so both locales share one control and one probe script.
- Probe is `site/src/lib/probeWindowsDownload.ts`: single `fetch` with `Accept: application/vnd.github+json`, no `Authorization`, no retry. Picker rules unchanged.
- No CSP was added; `connect-src` is therefore not applicable.

## Learnings

- Astro processed `<script>` in the layout inlines `selectWindowsDownload` + probe into each locale HTML module (no separate `_astro/*.js`).
- Context7 MCP was unavailable in this worker; used Astro processed client `<script>` import.

## Files / Surfaces

- `site/src/layouts/Landing.astro`
- `site/src/lib/probeWindowsDownload.ts`
- `site/src/lib/selectWindowsDownload.ts` (consumed, not edited)

## Errors / Corrections

## Ready for Next Run

- task_06 deploys this inlined script as static HTML; do not strip `<script type="module">`.
