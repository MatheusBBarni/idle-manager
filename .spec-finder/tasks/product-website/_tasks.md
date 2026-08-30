# product-website tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Ship the English isolation landing | US-01 | frontend | high | [] | completed |
| task_02 | Select a Windows Download href from GitHub Releases JSON | US-03 | frontend | medium | [] | completed |
| task_03 | Ship the Portuguese landing and locale links | US-06 | frontend | medium | [task_01] | pending |
| task_04 | Ship privacy copy, MIT LICENSE, and source link | US-05 | frontend | medium | [task_01, task_03] | pending |
| task_05 | Wire Download probe and SmartScreen warning | US-03 | frontend | medium | [task_01, task_02, task_03] | pending |
| task_06 | Publish the site with GitHub Pages Actions | F-01 | infra | medium | [task_03, task_04, task_05] | pending |

## Execution order

1. **task_01** — English `/idle-manager/en/` isolation landing (`site/` scaffold).
2. **task_02** — Pure `selectWindowsDownload` + unit tests (no Electron).
3. **task_03** — Portuguese `/pt/`, locale links, `/` → `/en/`.
4. **task_04** — Privacy, MIT `LICENSE`, GitHub source link.
5. **task_05** — Browser Releases probe + always-on Download + SmartScreen copy.
6. **task_06** — GitHub Actions → Pages. Enabling Pages in repo Settings is rollout, not a task.

**Roots:** task_01, task_02  
**Leaf:** task_06  
**Critical path:** task_01 → task_03 → task_04 → task_06 (task_05 joins after task_02 and task_03)  
**Parallelizable:** {task_01, task_02} — no declared dependency between them; numeric order still runs 01 before 02.  
**Spikes / blockers:** none.

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| US-01 | task_01 | Player can read isolation vs bot on English landing |
| US-03 | task_02, task_05 | Download href from first `.exe` or GitHub `/releases/latest` |
| US-06 | task_03 | Same claims on `/pt/` with locale links |
| US-05 | task_04 | Privacy (app vs host vs GitHub API), MIT, source |
| F-01 | task_06 | Operator can deploy the static site to project Pages |

US-02 (empty installer), US-04 (no mac/linux installer buttons), US-07 (keyboard) are covered inside task_01/task_05, not as separate tasks.

## Tie-break rationale

task_01 before task_02: user-visible landing unlocks more downstream work than the picker contract. task_03 before task_04: privacy/source must land on both locales. task_05 after task_03 so the probe is on EN and PT. task_06 last so the first deploy includes copy, probe, and LICENSE.
