# Workflow Memory

## Current State

- Packet `keyboard-shortcuts` task_01–task_03 completed.
- 2026-08-30: operator overrode landing **section** → PT+EN keyboard **docs pages** (ADR-004). PRD, TechSpec, and tasks rewritten.

## Shared Decisions

- No spikes. `[`/`{` and chrome-editable probe stay inside task_01.
- Public lookup: `{base}/en/keyboard/` and `{base}/pt/keyboard/`. Landing may link; must not list binds.
- task_02 and task_03 are parallelizable after task_01; numeric order still 02 then 03.
- Prev/next matcher keys: `[`/`{` and `]`/`}`; display strings stay `Ctrl+Shift+[` / `⌘⇧[` and `Ctrl+Shift+]` / `⌘⇧]`.

## Shared Learnings

- Keyboard create is `account/create` + `account/activate` with a supplied id; mouse create without id still does not steal `activeAccountId`.

## Open Risks

- G-01 guest-focus is dogfood, not CI (task_01 report must record the gap).
- Chrome URL-bar skip can miss the first chord after keyboard-focus (`Mod+L`) because the editable probe is async.
- product-website PRD still says “no extra URLs”; this packet’s ADR-004 is the explicit override for one keyboard page per locale.

## Handoffs

- task_02 / task_03: four frozen accelerators `Mod+Shift+N`, `Mod+Shift+[`, `Mod+Shift+]`, `Mod+Enter`. Do not reimplement the interceptor.
