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
- [CODING_CONVENTIONS.md](CODING_CONVENTIONS.md): coding and linting conventions

## How to Develop

- Install Node 24 (other versions might very well work)
- Enable Corepack if needed: `corepack enable`
- `pnpm install`
- `pnpm run dev`

### Test on a phone over HTTPS

Mobile browser fullscreen APIs require a secure origin. For LAN testing, install
[mkcert](https://github.com/FiloSottile/mkcert), then run these commands in PowerShell
from the project directory (replace the example address with your computer's LAN IP):

```powershell
mkcert -install
New-Item -ItemType Directory -Force .certs
mkcert -key-file .certs/lan-key.pem -cert-file .certs/lan-cert.pem 192.168.1.94
pnpm run dev
```

With both local certificate files present, Vite serves HTTPS automatically. Install
mkcert's local root certificate (`mkcert -CAROOT`, file `rootCA.pem`) on the phone and
trust it, then open `https://192.168.1.94:5173`. Allow Vite through the computer's
firewall on the private network if the phone cannot connect. The `.certs` directory is
git-ignored and should never be committed.

For a browser-chrome-free Android test, open the HTTPS URL in Chrome (not an embedded
Custom Tab), install Roket from Chrome's menu, and launch it from its Home Screen icon.
The web app manifest requests fullscreen display when installed.

When installation is available, the main menu suggests installing Roket. On iOS,
it provides Share menu instructions instead of a native prompt. Dismissing the
suggestion hides it for the current browser session. Browser installability rules
and secure-origin requirements still apply.

Many people find the linter a bit sadistic, especially the _complexity_ rule. Sorry (not sorry).

## Deploy

The production Amplify app uses manual deployments; pushing to GitHub does not
deploy it. To build and deploy from PowerShell, install the AWS CLI and configure
the `laurila` profile with access to the app, then run:

```powershell
./deploy.ps1
```

The script deploys the current working tree to the `main` production branch in
`eu-north-1` and waits for the deployment result. It does not push to GitHub.
