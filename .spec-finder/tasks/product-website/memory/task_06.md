# Task Memory: task_06

## Objective Snapshot

GitHub Actions deploy of `site/` to project Pages.

## Important Decisions

- Context7 MCP was unavailable in this worker; Pages YAML follows current official Astro GitHub Pages guide (`withastro/action@v6`, `actions/checkout@v7`, `actions/deploy-pages@v5`) with `path: site`.
- New `.github/workflows/deploy.yml` only. Electron `ci.yml` and `release.yml` left unchanged.
- `concurrency.group: pages` so Pages deploys do not share CI/release groups.
- No `GITHUB_TOKEN` / secret for the browser Releases GET.

## Learnings

- Nested Astro app needs `withastro/action` `path: site` so install/build use `site/pnpm-lock.yaml`.
- Workflow cannot be proven live without GitHub; local `pnpm --dir site build` + YAML review is the gate.

## Files / Surfaces

- `.github/workflows/deploy.yml` — Pages build + deploy
- `site/astro.config.mjs` — unchanged `site`/`base`

## Errors / Corrections

- None.

## Ready for Next Run

- Packet code is done. Remaining rollout: GitHub Settings → Pages → Source = GitHub Actions.
