---
description: Handoff current session into a new wt-spin worktree and tmux Pi session
argument-hint: "[handoff focus]"
---

Create a handoff for the current work, spin a new git worktree, and start a fresh interactive Pi session there.

Treat this prompt invocation as explicit consent to create a new branch/worktree with `wt-spin` and to create a tmux session. Do not commit, push, pull, reset, clean, stash, or delete anything unless the user separately asks.

Workflow:

1. Load and follow the `handoff` skill. If `$ARGUMENTS` is non-empty, pass it as the handoff focus. Otherwise, tailor the handoff to continuing the current task.
2. Save the handoff document in the OS temporary directory, as required by the `handoff` skill, and keep track of its absolute path.
3. Derive a short conventional branch slug from the handoff focus or current task:
   - Prefer prefixes like `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, or `ci/`.
   - Use lowercase kebab-case after the prefix.
   - Keep it concise and specific.
4. Run `git status --short --branch` and `git worktree list` so the handoff notes can mention any existing dirty state. Do not try to move uncommitted changes into the new worktree.
5. Run `wt-spin "${branch_slug}"` from the current repository.
6. Determine the new worktree path. Prefer parsing `git worktree list --porcelain` for the derived branch; if that is ambiguous, inspect the `wt-spin` output and ask the user only if the path cannot be determined.
7. Create a temporary prompt file for the new Pi session. The prompt must instruct the next agent to:
   - Read the handoff document by absolute path.
   - Continue implementation in the new worktree.
   - Read applicable repo instructions and skills.
   - Run validation before final handoff.
8. Start a detached tmux session in the new worktree with a unique, slug-derived session name:

   ```sh
   tmux new-session -d -s "${session_name}" -c "${worktree_path}" "pi @${prompt_path}"
   ```

9. Report:
   - handoff path
   - branch slug
   - worktree path
   - tmux session name
   - attach command, e.g. `tmux attach -t "${session_name}"`

Fail fast and do not start tmux if handoff creation, `wt-spin`, or worktree-path resolution fails.
