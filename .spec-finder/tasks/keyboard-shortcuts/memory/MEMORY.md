# Workflow Memory

## Current State

- Packet `keyboard-shortcuts` tasks: task_01–task_03 pending.
- 2026-08-30: operator overrode landing **section** → PT+EN keyboard **docs pages** (ADR-004). PRD, TechSpec, and tasks rewritten.

## Shared Decisions

- No spikes. `[`/`{` and chrome-editable probe stay inside task_01.
- Public lookup: `{base}/en/keyboard/` and `{base}/pt/keyboard/`. Landing may link; must not list binds.
- task_02 and task_03 are parallelizable after task_01; numeric order still 02 then 03.

## Shared Learnings

## Open Risks

- G-01 guest-focus is dogfood, not CI (task_01 report must record the gap).
- product-website PRD still says “no extra URLs”; this packet’s ADR-004 is the explicit override for one keyboard page per locale.

## Handoffs
