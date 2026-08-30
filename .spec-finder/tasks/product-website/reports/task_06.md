# Task 06 Final Report: Publish the site with GitHub Pages Actions

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` worker (not ACP runtime)

## Changes

- `.github/workflows/deploy.yml` — New Pages workflow: `push` to `main` and `workflow_dispatch`; `contents: read`, `pages: write`, `id-token: write`; `withastro/action@v6` with `path: site`; `actions/deploy-pages@v5`. No secret for the public Releases GET. Does not upload installer binaries.
- `memory/MEMORY.md`, `memory/task_06.md` — Workflow path and Settings leftover.

Not changed: `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `site/astro.config.mjs` (`site`/`base` already set), `src/main/**` (including `isolationVerify.ts`), `vitest.config.ts`, root `package.json` scripts, picker/copy, `.spec-finder/config.json` (unrelated dirty preserved).

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. GitHub Actions workflow that builds `site/` and deploys to Pages (`withastro/action` / ADR-003) | satisfied | `.github/workflows/deploy.yml`: job `build` uses `withastro/action@v6` with `path: site`; job `deploy` uses `actions/deploy-pages@v5` after `needs: build`. |
| 2. Permissions `contents: read`, `pages: write`, `id-token: write`; no GitHub token for Releases GET | satisfied | Workflow `permissions` block has those three keys only. No `secrets.*`, no `GITHUB_TOKEN` env, no `GH_TOKEN`. Browser probe remains unauthenticated in site HTML. |
| 3. Build with the same `base` as TechSpec Public URLs | satisfied | `site/astro.config.mjs` still `site: 'https://matheusbarni.github.io'`, `base: '/idle-manager'`. `pnpm --dir site build` emitted `site/dist/en/index.html`, `site/dist/pt/index.html`, and `site/dist/index.html` redirecting to `/idle-manager/en/`. Built EN/PT asset hrefs are `/idle-manager/_astro/...` and `/idle-manager/icon.png`. |
| 4. Leave root `pnpm test` and `pnpm verify:isolation` unchanged and green | satisfied | `vitest.config.ts` still `include: ['src/shared/**/*.test.ts']`. `src/main/isolationVerify.ts` not edited. Root `pnpm test`: 4 files, 19 tests passed. Isolation verify command was not required by this task’s verification list; the file and root test include are untouched. |
| 5. Support `workflow_dispatch` as well as push to `main` | satisfied | `on.push.branches: [main]` and `on.workflow_dispatch:` in `deploy.yml`. |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm --dir site build` | pass | Exit 0. Log: `output: "static"`, `├─ /en/index.html`, `├─ /pt/index.html`, `├─ /index.html`, `3 page(s) built`. |
| Built locales under `base` | pass | `site/dist/en/index.html` and `site/dist/pt/index.html` exist; stylesheet/icon hrefs are `/idle-manager/...`; root `dist/index.html` redirects to `/idle-manager/en/`. |
| YAML review | pass | Separate from Electron CI/release. Permissions match the contract. `path: site`. No installer artifact upload. `concurrency.group: pages` (not `ci-*` / `release-*`). |
| `pnpm test` | pass | Exit 0. Vitest v3.2.7: 4 files, 19 tests passed (partition, i18n, layout, workspace). Duration 232ms. |
| Live Pages deploy | documented limitation | Workflow cannot be proven live without GitHub. Enabling Pages in Settings is rollout, not this gate. |

## Risks and Follow-ups

- **Rollout leftover:** GitHub repo Settings → Pages → Source = GitHub Actions. Until that is set, the workflow exists but `https://matheusbarni.github.io/idle-manager/` may 404.
- Live workflow run was not executed in this environment.
- Do not publish installer binaries onto Pages; Electron packaging remains `release.yml` → GitHub Releases.

## Final Verdict

completed — `.github/workflows/deploy.yml` builds the nested `site/` Astro app with `withastro/action@v6` and deploys via `actions/deploy-pages@v5` on `main` or `workflow_dispatch`, with the required Pages permissions and no Releases API token; local `pnpm --dir site build` still emits `/en/` and `/pt/` under `/idle-manager`, and root `pnpm test` stays green. Pages Settings enablement remains operator rollout.
