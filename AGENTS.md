# Agent rules for this repository

## Git — hard rules

- **NEVER `git commit` without explicit permission from the user.** Stage and prepare changes, show a summary, and wait for the user to say "commit" (or equivalent) first.
- **NEVER `git push` without explicit permission from the user.** The user always decides when to push.
- Keep commits scoped: only include files related to the change being made. Unrelated dirty files stay uncommitted.
- Do not rebase, merge, or rewrite history without asking.

## Repository facts

- Angular 18 standalone app (hash routing) deployed to GitHub Pages via `.github/workflows/deploy-gh-pages.yml` (auto-runs on push to `main`; sets `--base-href` itself).
- Data pipeline: `npm run build:data` regenerates `src/app/configurator-data/tweaks.json` and `categories.json` from `configurator-input/` (tweaks: `<name>/<name>-<version>.lua` + `0-info.md` + `0-authors.json`; categories: `0-choices.md`). Commit the regenerated JSON together with the input changes.
- Tweak changelogs live in each tweak's `0-info.md` (`## <version>` entries, newest first).
- Verify with `npx ng build --configuration development` before committing.
