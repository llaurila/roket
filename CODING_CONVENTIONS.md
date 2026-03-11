# Coding Conventions

This guide explains the coding and testing conventions used in Roket.

For level-specific authoring guidance, see [LEVELS.md](LEVELS.md).
For AI tuning guidance, see [AI.md](AI.md).

## Core Principles

- Keep gameplay logic deterministic and readable.
- Prefer small, focused methods over complex methods.
- Use explicit state names that match gameplay semantics.
- Keep code test-friendly (Node test environment, browser APIs guarded).

## Tooling Baseline

- Language: TypeScript in strict mode.
- Package manager: `pnpm`.
- Lint: ESLint with TypeScript strict + stylistic rules.
- Test: Vitest.

Before opening a PR, run:

```bash
pnpm lint
pnpm test
```

## TypeScript Style

- Use explicit member visibility (`public`, `private`, `protected`).
- Prefer `import type` for type-only imports.
- Avoid `any`.
- Keep class member ordering consistent (the linter enforces this).

## Naming Conventions

Lint-enforced naming is:

- Variables: `camelCase`, `PascalCase`, or `UPPER_CASE`
- Functions: `camelCase` or `PascalCase`
- Types/interfaces/classes/enums: `PascalCase`

In practice:

- Use `UPPER_CASE` for module-level constants.
- Use `camelCase` for local values and methods.

## Formatting And Complexity Rules

Key enforced rules:

- Max line length: 100
- Max file length: 300 lines (excluding blank lines/comments)
- Max cyclomatic complexity per method/function: 5
- Use double quotes
- Use semicolons
- No trailing spaces
- No `console.*`

If you hit complexity/file-size limits, refactor into helper methods/modules.

## Magic Numbers

`no-magic-numbers` is enforced in runtime code.

### Runtime code

- Prefer named constants:

```ts
const RECHARGE_DELAY = 0.35;
```

### Tests

- It is okay to disable `no-magic-numbers` in tests when numeric literals make assertions clearer.
- Prefer the narrowest disable scope possible.
- If many literals are needed in one test file, file-level disable is acceptable:

```ts
/* eslint-disable no-magic-numbers */
```

Important: remove unused disables. ESLint reports unused directives.

## Import Conventions

- Use `@/` alias for cross-folder imports from `src`.
- Use relative imports for same-folder modules.
- Keep imports clean and type-only where possible.

## Testing Conventions

- Put tests close to code as `*.test.ts`.
- Keep tests deterministic (fixed seeds/inputs where possible).
- Restore spies/mocks in `beforeEach` when needed.
- Unit tests run in a Node environment by default, not a browser.
  - Do not assume `document`/canvas/window APIs exist unless explicitly mocked.

## Gameplay State Conventions

Avoid conflating lifecycle flags with gameplay outcomes.

Example:

- `alive`: whether an object still exists in simulation.
- `collected`: whether the player/NPC successfully collected a fuel capsule.

Use the state that matches objective semantics. Do not use `!alive` as a substitute for `collected` unless the design explicitly intends that.

## Rule Disables

When disabling lint rules:

- Prefer one-line disables over file-level disables.
- Add a clear reason if the intent is not obvious.
- Keep disables local and temporary.

Acceptable examples:

- `/* eslint-disable no-magic-numbers */` in numeric-heavy test files.
- `/* eslint-disable-next-line @typescript-eslint/no-floating-promises */` for intentionally fire-and-forget calls.

## Practical Refactoring Guidance

When a function becomes hard to reason about:

1. Extract one concern into a private helper.
2. Name helpers by behavior, not implementation detail.
3. Keep side effects localized.
4. Re-run lint and tests after each step.

This keeps the codebase aligned with the strict lint setup while preserving readability.
