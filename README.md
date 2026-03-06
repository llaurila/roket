# Roket

2D spaceship game with Newtonian physics.
© Vincent Laurila 2019-2026

If you just want to play, go to <https://roket.laurila.net/>

## Overview

Roket is a pure TypeScript project built from scratch without a game engine. Rendering is done directly with the HTML canvas API, and the game loop, physics, scene flow, UI, and drawing primitives are all implemented in this repository.

## Architecture At A Glance

If you are new to the codebase, start at `src/main.ts`.

- `src/main.ts` is the browser entry point. It preloads music, unlocks audio on the first user gesture, restores saved audio settings from `Store`, and enters the main menu.
- `src/Scenes/MainMenu` builds the first running scene. It creates the canvas viewport, background graphics, menu UI, and starts the shared `Game` loop.
- `src/Game/index.ts` contains the core runtime loop based on `requestAnimationFrame`. It advances simulation in fixed physics steps, draws the current viewport, and runs recurring tasks.
- `src/Scenes/Gameplay` switches from the menu into an actual mission. It selects a level class from `src/Levels`, initializes it, handles restart and level progression, and draws gameplay plus debug overlays.
- `src/Level/index.ts` is the main composition point for gameplay. A level owns the viewport, `Graphics` collection, `PhysicsEngine`, player ship, objectives, HUD, intros/outros, and mission success or failure flow.
- `src/Graphics` contains the canvas-facing rendering layer: camera, viewport, shapes, particles, and the drawable object container used by levels and menus.
- `src/Physics` contains the simulation layer: bodies, colliders, forces, environments, and the physics updater that advances all active objects.
- `src/Ship`, `src/ShipController.ts`, `src/Controls`, and `src/Player` cover the controllable ship, input handling, and player state.
- `src/components` contains reusable in-game UI pieces such as menus, HUD widgets, dialogs, and window helpers.
- `src/Levels` contains the concrete missions. Each level class extends the base `Level` and defines its own objects, objectives, and rules.
- `src/Sounds`, `src/ImageLoader.ts`, `src/config`, and supporting utility files provide the asset loading, runtime configuration, persistence, and shared helpers that the higher-level systems use.

## Documentation

- [LEVELS.md](LEVELS.md): level authoring guide
- [AI.md](AI.md): high-level guide to the NPC AI controller and tuning

## How to Develop

- Install Node 24 (other versions might very well work)
- Enable Corepack if needed: `corepack enable`
- `pnpm install`
- `pnpm run dev`
