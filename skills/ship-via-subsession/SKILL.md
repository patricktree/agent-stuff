---
name: ship-via-subsession
description: Hand one change to a new interactive session that implements it via the implement skill and opens a PR; you write the brief and verify the PR.
argument-hint: "[task description]"
disable-model-invocation: true
---

# Ship via subsession

A **subsession** is a separate, interactive agent session started from this one: the user can open it, steer it, and answer its questions, and it outlives this turn. This session writes the brief and verifies the result; the subsession does the work and ends at an open pull request, or at local commits when it works on the default branch.

## Input

- `$ARGUMENTS`: the task, in the user's words.
- Empty input: use the change agreed most recently in this conversation. If nothing was agreed, ask the user for the task and stop.
- The invocation authorizes the subsession to branch, commit, push, and open a PR. Merging stays with the user.

## Workspace

The **workspace** is where the subsession works, and it decides the branch:

- `worktree` (default): a new git worktree on its own branch, kept apart from this checkout.
- `here` (opt-in): the directory this session is in, worktree or main checkout, on the branch already checked out. Choose it only when the user asks in words, for example "do it here" or "in the main checkout".

## Step 1: Write the brief

The brief is the subsession's first message. It is done when a reader with no access to this conversation could start the work: every decision already made is written down, and every open question is named so the subsession can ask the user. Include:

| Part | Content |
| ---- | ------- |
| Repo | absolute path of the main checkout, default branch |
| Workspace | `worktree`, or `here` with this session's directory and its current branch |
| Task | what to change, in your words, not "as discussed" |
| Context | files and packages involved, decisions already made and why, what must stay unchanged |
| Open questions | anything still undecided, for the subsession to put to the user |
| Done | observable end state, as a checklist |
| Procedure | the fixed procedure below, copied verbatim |

### Fixed procedure

1. **Branch.** Workspace `worktree`: give the worktree's branch a descriptive name with `git branch -m <name>`. Workspace `here`: stay on the branch already checked out.
2. **Implement.** Read `~/.agents/skills/implement/SKILL.md` and follow it for the task in this brief. The skill is manual-only, so read the file directly.
3. **Ask.** Put ambiguity to the user in this session as it comes up.
4. **Open the PR.** Push the branch and run `gh pr create`, writing the body with the `pr` skill. When the branch is the default branch (workspace `here` in the main checkout), stop after committing instead: the commits stay local for the user to push.
5. **Report.** Stop at the open PR, or at the last commit, and report the PR URL or commit hashes, a summary of the change, the review findings applied and skipped (with reasons), and the validation results, stating plainly anything that failed or was skipped.

## Step 2: Start the subsession

Start exactly one subsession with the brief as its prompt, in the chosen workspace. In the Claude desktop app, call `start_session` with `initiation: "user_asked"` and `use_worktree: true` for `worktree` or `use_worktree: false` for `here`; pick `context: "fork"` while this conversation is short and the task leans on it, `"fresh"` otherwise.

This step is done when the tool result confirms the subsession started. Give the user its name and link, then end the turn.

If this agent has no tool for starting an interactive session, tell the user and stop; the work belongs in a subsession they can talk to.

## Step 3: Verify the PR

When the subsession reports back, treat the report as claims. This step is done when every item below is confirmed or corrected:

1. The PR exists and is open; record its CI state, where pending is a valid answer. Without a PR, the reported commits exist on the current branch.
2. Every item of the brief's **Done** checklist holds in the PR diff, or in the commits' diff.

Report to the user with the PR link (or commit hashes) first, corrected by what you verified.
