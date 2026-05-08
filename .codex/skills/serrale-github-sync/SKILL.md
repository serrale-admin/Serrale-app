---
name: serrale-github-sync
description: Safely sync this SERRALE workspace to GitHub using a personal access token provided at runtime through environment variables. Use when committing, pushing, creating branches, or troubleshooting auth errors for this project without hardcoding secrets.
---

# SERRALE GitHub Sync

## Workflow

1. Confirm target repository and branch before any push.
2. Set PAT in environment variable `SERRALE_GITHUB_PAT` for the current shell only.
3. Validate git availability and repository state.
4. Stage and commit intended files with a clear message.
5. Push with authenticated header using `scripts/push_with_pat.ps1`.
6. Clear the token from environment after push.

## Rules

- Never hardcode PATs in source files, skills, scripts, `.env`, or chat replies.
- Never print token values to console output.
- Never store tokenized remote URLs in git config.
- Prefer short-lived shell environment variables over persistent storage.

## Commands

```powershell
$env:SERRALE_GITHUB_PAT = "<paste-token-for-this-session-only>"
```

```powershell
git add -A
git commit -m "chore: update expo sdk 54 compatibility and router runtime alignment"
```

```powershell
.\.codex\skills\serrale-github-sync\scripts\push_with_pat.ps1 -RepoPath . -Remote origin
```

```powershell
Remove-Item Env:SERRALE_GITHUB_PAT
```

## Troubleshooting

- `git not recognized`: install Git and reopen terminal.
- `not a git repository`: initialize/clone repo first, then retry.
- `403` or `401`: PAT is invalid, expired, or missing required scopes.
- Wrong target branch: rerun with `-Branch <name>`.
