# Workflow Memory

## Current State

- Packet `product-website` tasks task_01–task_06 generated pending after graph approval.
- No implementation started.

## Shared Decisions

- Graph: 01 EN landing, 02 picker (parallelizable with 01), 03 PT locales, 04 privacy+LICENSE+source, 05 Download probe, 06 Pages Action.
- G-03 hide-button relaxed by ADR-004 (always-on Download, fallback to GitHub Releases).

## Shared Learnings

## Open Risks

- task_01 and task_02 both create/edit `site/package.json` if run truly in parallel; numeric order is 01 then 02.
- Enabling GitHub Pages in repo Settings is outside git (task_06 rollout).

## Handoffs
