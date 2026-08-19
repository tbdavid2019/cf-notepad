# Agent Standards & Automated Sync Rule

## Mandatory Workflow Requirements:
1. **Automatic Documentation Sync**: Every single code change, feature, bug fix, or refactor MUST update both `CHANGELOG.md` (under today's date) and `README.md` (both Traditional Chinese and English sections) automatically in the same turn without asking the user.
2. **Quality & Tests**: Always run `npm test` and ensure 317+ tests pass with 0 errors before completion.
3. **Deployment**: When deploying, run `npm run deploy` and verify the live Version ID.
4. **Git Discipline**: Clean commits with Conventional Commits, pushed to `origin/main`.
