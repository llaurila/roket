import Game from "@/Game";
import Keys from "../../Controls/Keys";
import Pointer from "@/Controls/Pointer";
import { hasTouchScreen } from "@/Controls/Device";
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
import LightningMineIntro from "@/Levels/LightningMineIntro";
import MeteorField from "@/Levels/MeteorField";
import BlockadeRun from "@/Levels/BlockadeRun";
import {
    getNextLevelIndex,
    getPreviousLevelIndex,
    hasNextLevel,
    hasPreviousLevel,
} from "./levelNavigation";

const TOUCH_GUIDE_DURATION = 10;
const TOUCH_GUIDE_FADE_DURATION = 2;
const TOUCH_GUIDE_RADIUS = 42;
const TOUCH_GUIDE_OPACITY = 0.12;
const TOUCH_GUIDE_X_RATIO = 0.25;
const TOUCH_GUIDE_Y_RATIO = 0.8;

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
    LightningMineIntro,
    MeteorField,
    BlockadeRun
];

let currentLevel = 0;

export function loadLevel(number: number) {
    Pointer.ignoreCurrentTouches();
    const showTouchGuide = hasTouchScreen();
    let levelTime = 0;
    let touchGuideStartTime: number | null = null;
    const initialTouchPressId = Pointer.getTouchPressId();
    let retryRequested = false;
    let continueRequested = false;

    if (number < 0 || number >= levelTypes.length) {
        window.document.body.innerHTML = "<h1>Invalid level number</h1>";
        throw new Error(`Invalid level number: ${number}`);
    }

    currentLevel = number;

    const level: Level = new levelTypes[number];
    level.hasNextLevel = hasNextLevel(number, levelTypes.length);
    level.addEventListener("retry", () => { retryRequested = true; });
    level.addEventListener("continue", () => { continueRequested = true; });

    const game = new Game(update, draw, level.viewport);

    level.init(game.viewport, number);

    game.every(1, () => {
        level.physics.cleanUp();
        level.graphics.cleanUp();
    });

    game.start();

    function update(time: number, delta: number) {
        if (handleLevelNavigation()) return;

        levelTime = time;
        if (hasFirstTouchSinceLevelStart()) {
            touchGuideStartTime = time;
        }
        handleDebug(game);

        if (level.shipController) {
            level.shipController.control();
        }

        level.update(time, delta);

        panTowardsShip(level, delta);
    }

    function handleLevelNavigation(): boolean {
        return !game.running || handleNextLevel() || handleRestart();
    }

    function handleNextLevel(): boolean {
        if (!level.passed || !level.hasNextLevel) return false;
        if (!continueButton() && !continueRequested) return false;

        loadNextLevel(game);
        return true;
    }

    function handleRestart(): boolean {
        if (!restartButton() && !retryRequested) return false;

        game.stop();
        loadLevel(currentLevel);
        return true;
    }

    function draw(viewport: Viewport): void {
        viewport.update();

        const { ctx } = viewport;

        ctx.save();
        ctx.transform(1, 0, 0, -1, 0, ctx.canvas.height);

        level.graphics.draw(viewport);

        ctx.restore();

        if (showTouchGuide && !level.ended) {
            drawTouchControlsGuide(viewport, getTouchGuideOpacity(getTouchGuideElapsed()));
        }

        drawFps(ctx, game.fpsTracker.currentFps);
        drawNpcAiDebug(ctx, level);
    }

    function hasFirstTouchSinceLevelStart(): boolean {
        return showTouchGuide && touchGuideStartTime === null &&
            Pointer.getTouchPressId() !== initialTouchPressId;
    }

    function getTouchGuideElapsed(): number {
        return touchGuideStartTime === null ? 0 : levelTime - touchGuideStartTime;
    }
}

function getTouchGuideOpacity(levelTime: number): number {
    const fadeStart = TOUCH_GUIDE_DURATION - TOUCH_GUIDE_FADE_DURATION;
    if (levelTime >= TOUCH_GUIDE_DURATION) return 0;
    if (levelTime <= fadeStart) return 1;

    return (TOUCH_GUIDE_DURATION - levelTime) / TOUCH_GUIDE_FADE_DURATION;
}

function drawTouchControlsGuide(viewport: Viewport, opacity: number): void {
    if (opacity <= 0) return;

    const { ctx, width, height } = viewport;
    const centerY = height * TOUCH_GUIDE_Y_RATIO;

    ctx.save();
    ctx.globalAlpha = TOUCH_GUIDE_OPACITY * opacity;
    ctx.fillStyle = "#ffffff";
    drawTouchGuideCircle(ctx, width * TOUCH_GUIDE_X_RATIO, centerY);
    drawTouchGuideCircle(ctx, width * (1 - TOUCH_GUIDE_X_RATIO), centerY);
    ctx.restore();
}

function drawTouchGuideCircle(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number
): void {
    ctx.beginPath();
    ctx.arc(centerX, centerY, TOUCH_GUIDE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
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
