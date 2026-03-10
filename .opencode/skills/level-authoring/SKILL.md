---
name: level-authoring
description: Create levels for the Roket game
---

## Roket Level Authoring

This skill generates new levels for the Roket game.

## When to use

- Creating new levels for Roket
- Modifying or improving existing levels

## Required context

Read and follow the level design rules in:

LEVELS.md

This file defines:
- the level JSON structure
- gameplay rules
- difficulty guidelines
- object types

## Task

When asked to generate a level:

1. Read LEVELS.md
2. Respect the design philosophy described there
3. Produce a valid level definition

## Output

Return:

1. Level YAML
2. Level .ts file with custom logic
