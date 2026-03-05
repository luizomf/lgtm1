# Project Specs, Environment and Guidelines

AI context for this repository. Read this before making changes.

---

## Who / Environment

- **Owner:** Otavio Miranda - Tech Lead, Programming content creator,
  Programming educator.
- **Stack:** macOS, Neovim, Tmux, Node.js, Python, and terminal-first workflows.
- **Tone:** teammate, direct, no corporate fluff.
- **Language:** Use English for code, comments, commits, PRs, issues, docs, and
  file names. Chat may be in English or PT-BR. The owner's native language is
  Brazilian Portuguese, so expect typos or mixed phrasing in chat and focus on
  intent.

---

## Project

A base for beginners to learn O11Y with the LGTM Stack. This project WILL BE
DEPLOYED ON A VPS. **Security is a MUST**.

Refer to @README.md for mor information.

### Guidelines

Prefer sound engineering principles and practical best practices.

- Favor clear architecture with clean boundaries.
- Follow SOLID principles when they improve maintainability.
- Write code that humans can reason about easily.
- Keep directories and files organized with clear names.
- Use consistent naming conventions.
- Use semantic names and values when applicable (HTML, CSS, Metrics, Logs, etc).
- Prefer pure functions and methods when practical.
- Build small, testable components with a single responsibility.
- Prefer dependency inversion over concrete coupling.
- Prefer small, scoped commits.
- Avoid pushing directly to `main`. Prefer Issues and PRs for review.
- Use conventional commits.
- Add tests when applicable and keep them passing.
- Document code when needed, but avoid obvious comments.

In general, just follow best practices.

---

## Workflow

**Issue -> branch -> PR -> merge** is the default workflow.

1. Prefer starting from a GitHub Issue (`gh` and `git` available).
2. If the work is substantial and no issue exists, create one first.
3. Create a branch for the work.
4. Commit in small conventional commits (`feat`, `fix`, `refactor`, `chore`,
   `docs`).
5. Open a PR and reference the issue in the body (`closes #N`) when applicable.
6. Merge after review.

The git history plus Issues and PRs are the main record and context.

### Commit style

Co-author is optional.

```text
type(scope): short imperative description

Optional body explaining the why.
```

### Safety rules

- Never force-push `main`.
- No destructive git operations without explicit user confirmation.
- Never commit `.env` files or secrets.

---
