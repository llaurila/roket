import Game from "@/Game";
import Keys from "../../Controls/Keys";
import { panTowardsShip } from "../../cinematics";
import { drawFps, drawNpcAiDebug } from "../../debug";
import Introduction from "@/Levels/Introduction";
import VelocityControl from "@/Levels/VelocityControl";
import CollectFuel from "@/Levels/CollectFuel";
import DeepSpaceMission from "@/Levels/DeepSpaceMission";
import type Level from "@/Level";
import type { Viewport } from "@/Graphics/Viewport";
import GameOfTag from "@/Levels/GameOfTag";
import FuelRush from "@/Levels/FuelRush";
import HotLap from "@/Levels/HotLap";
import GravityHarvest from "@/Levels/GravityHarvest";
import MeteorField from "@/Levels/MeteorField";
import BlockadeRun from "@/Levels/BlockadeRun";
import {
    getNextLevelIndex,
    getPreviousLevelIndex,
    hasNextLevel,
    hasPreviousLevel,
} from "./levelNavigation";

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
    GameOfTag,
    HotLap,
    FuelRush,
    GravityHarvest,
    MeteorField,
    BlockadeRun
];

let currentLevel = 0;

export function loadLevel(number: number) {
    if (number < 0 || number >= levelTypes.length) {
        window.document.body.innerHTML = "<h1>Invalid level number</h1>";
        throw new Error(`Invalid level number: ${number}`);
    }

    currentLevel = number;

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
            loadNextLevel(game);
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
        drawNpcAiDebug(ctx, level);
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
        loadNextLevel(game);
    }
}

function handleDebugLevelChangePrevious(game: Game) {
    if (previousLevelButton()) {
        loadPreviousLevel(game);
    }
}

function loadNextLevel(game: Game) {
    if (!hasNextLevel(currentLevel, levelTypes.length)) {
        return;
    }

    currentLevel = getNextLevelIndex(currentLevel, levelTypes.length);
    game.stop();
    loadLevel(currentLevel);
}

function loadPreviousLevel(game: Game) {
    if (!hasPreviousLevel(currentLevel)) {
        return;
    }

    currentLevel = getPreviousLevelIndex(currentLevel);
    game.stop();
    loadLevel(currentLevel);
}

function checkForDebugMode(): boolean {
    if (debugButton()) {
        Game.debugMode = !Game.debugMode;
    }
    return Game.debugMode;
}
