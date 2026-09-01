# Workflow Memory

## Current State

Packet tasks written, none started. Canonical order: task_01 → task_02 → task_03 → task_04. task_02 and task_03 both depend only on task_01 but share `workspace.ts` / `Sidebar.tsx` / `i18n.ts` — run by numeric ID.

## Shared Decisions

## Shared Learnings

## Open Risks

- Guest-focus for the three loop chords is dogfood, not CI (same as prior shortcut packets).

## Handoffs
