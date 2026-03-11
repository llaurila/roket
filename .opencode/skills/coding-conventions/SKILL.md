---
name: coding-conventions
description: Enforce Roket coding conventions for all code changes
---

## Roket Coding Conventions

Use this skill whenever you are making code changes in this repository.

## Primary Source Of Truth

Read and follow:

- `CODING_CONVENTIONS.md`

Also respect:

- `README.md` (project overview and scripts)
- `LEVELS.md` when changing level logic/data
- `AI.md` when changing NPC AI behavior/tuning

## Required Behavior

When implementing any change:

1. Follow lint constraints (line length, complexity, member ordering, no magic numbers in runtime code, etc.).
2. Keep methods small and refactor instead of silencing complexity warnings.
3. Use explicit state semantics (for example, do not conflate `alive` with `collected`).
4. Use `import type` for type-only imports.
5. Keep test code deterministic.
6. Prefer narrow lint disables; file-level disables are acceptable in tests when numeric assertions are clearer.
7. Remove unused eslint-disable directives.

## Test And Validation Workflow

After edits:

1. Run targeted tests for changed areas.
2. Run `pnpm lint`.
3. If practical for the scope, run full `pnpm test`.

## Output Expectations

In your final response:

1. List changed files.
2. Explain why choices align with conventions.
3. Report lint/test results.
4. Call out any intentional rule disables and why they are justified.
