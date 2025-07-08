import Game from "@/Game";
import Keys from "../../Controls/Keys";
import { panTowardsShip } from "../../cinematics";
import { drawFps } from "../../debug";
import Introduction from "@/Levels/Introduction";
import VelocityControl from "@/Levels/VelocityControl";
import CollectFuel from "@/Levels/CollectFuel";
import DeepSpaceMission from "@/Levels/DeepSpaceMission";
import type Level from "@/Level";
import type { Viewport } from "@/Graphics/Viewport";

const restartButton = () => Keys.wasPressed("Escape");
const continueButton = () => Keys.wasPressed("Enter");
const debugButton = () => Keys.wasPressed("d");
const nextLevelButton = () => Keys.wasPressed("l");
const previousLevelButton = () => Keys.wasPressed("k");

const levelTypes = [
    Introduction,
    VelocityControl,
    CollectFuel,
    DeepSpaceMission,
];

let currentLevel = 0;

export function loadLevel(number: number) {
    const level: Level = new levelTypes[number];

    const game = new Game(update, draw, level.viewport);

    level.init(game.viewport, number);

    game.every(1, () => {
        level.physics.cleanUp();
        level.graphics.cleanUp();
    });

    game.start();

    function update(time: number, delta: number) {
        handleNextLevel();
        handleRestart();
        handleDebug(game);

        if (level.shipController) {
            level.shipController.control();
        }

        level.update(time, delta);

        panTowardsShip(level, delta);
    }

    function handleNextLevel() {
        if (shouldContinueToNextLevel()) {
            if (++currentLevel < levelTypes.length) {
                game.stop();
                loadLevel(currentLevel);
            }
        }
    }

    const shouldContinueToNextLevel = () => continueButton() && level.passed;

    function handleRestart() {
        if (restartButton()) {
            game.stop();
            loadLevel(currentLevel);
        }
    }

    function draw(viewport: Viewport): void {
        viewport.update();

        const { ctx } = viewport;

        ctx.save();
        ctx.transform(1, 0, 0, -1, 0, ctx.canvas.height);

        level.graphics.draw(viewport);

        ctx.restore();

        drawFps(ctx, game.fpsTracker.currentFps);
    }
}

function handleDebug(game: Game) {
    if (checkForDebugMode()) {
        handleDebugLevelChange(game);
    }
}

function handleDebugLevelChange(game: Game) {
    handleDebugLevelChangeNext(game);
    handleDebugLevelChangePrevious(game);
}

function handleDebugLevelChangeNext(game: Game) {
    if (nextLevelButton()) {
        if (++currentLevel < levelTypes.length) {
            game.stop();
            loadLevel(currentLevel);
        }
    }
}

function handleDebugLevelChangePrevious(game: Game) {
    if (previousLevelButton()) {
        if (currentLevel > 0) {
            currentLevel--;
            game.stop();
            loadLevel(currentLevel);
        }
    }
}

function checkForDebugMode(): boolean {
    if (debugButton()) {
        Game.debugMode = !Game.debugMode;
    }
    return Game.debugMode;
}
