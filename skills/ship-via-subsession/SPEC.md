# ship-via-subsession Specification

## Intent

Delegate one agreed change to a separate, interactive session (a subsession) that implements it following the `implement` skill and opens a GitHub PR. Unlike a background subagent, the subsession stays open, so the user can steer it and answer its questions.

## Scope

In scope:

- One change per invocation, ending in one open PR.
- Writing a self-contained brief, starting one subsession, and verifying the PR when the subsession reports back.
- Choosing the workspace: a new worktree on its own branch by default, or, only when the user asks, this session's directory on its current branch. On the default branch the subsession stops at local commits instead of a PR.

Out of scope:

- The implementation procedure itself, which lives in `implement`.
- Merging, auto-merge, or watching CI.
- Fan-out across several subsessions.

## Runtime Contract

- Invocation: manual only (`disable-model-invocation: true`; `agents/openai.yaml` for Codex), because it pushes and opens PRs.
- Input: `$ARGUMENTS`, falling back to the most recently agreed change, else asking the user.
- Output: the subsession's name and link at start; later, the verified PR link, its CI state, and the Done checklist checked against the diff.
- The brief carries no commit trailers or PR footer: the subsession takes them from its own instructions and attribution reminder.

## Dependencies

- `implement` (third-party, `~/.agents/skills/implement/SKILL.md`). It is manual-only, so the subsession reads the file instead of invoking the skill. Update the path if it moves.
- `pr` (third-party) for the PR body; `gh` authenticated for the target repo.
- A tool for starting interactive sessions: `start_session` in the Claude desktop app. Agents without one stop and tell the user.

## Maintenance Notes

- Supersedes `ship-via-subagent`, which ran the work in a background subagent with a hand-written procedure.
- Update `SKILL.md` and this spec together when the procedure or dependencies change.
