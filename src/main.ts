import Game from "./Game";
import Camera from "./Graphics/Camera";
import Keys from "./Controls/Keys";
import Level from "./Level";
import Introduction from "./Levels/Introduction";
import VelocityControl from "./Levels/VelocityControl";
import CollectFuel from "./Levels/CollectFuel";
import GameOfTag from "./Levels/GameOfTag";

const restartButton = () => Keys.wasPressed("Escape");
const continueButton = () => Keys.wasPressed("Enter");
const debugButton = () => Keys.wasPressed("d");
const nextLevelButton = () => Keys.wasPressed("l");
const previousLevelButton = () => Keys.wasPressed("k");

const levelTypes = [
    Introduction,
    VelocityControl,
    CollectFuel,
    GameOfTag
];

let currentLevel = 0;
loadLevel(currentLevel);

function loadLevel(number: number) {
    const level: Level = new levelTypes[number];

    const game = new Game(update, draw, level.camera);

    level.init(game.ctx, number);

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

        panTowardsShip(delta);
    }

    function handleNextLevel() {
        if (continueButton() && level.passed) {
            if (++currentLevel < levelTypes.length) {
                game.stop();
                loadLevel(currentLevel);
            }
        }
    }

    function handleRestart() {
        if (restartButton()) {
            game.stop();
            loadLevel(currentLevel);
        }
    }

    function draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;

        ctx.save();
        ctx.transform(1, 0, 0, -1, 0, ctx.canvas.height);

        level.graphics.draw(ctx, camera);

        ctx.restore();
    }

    function panTowardsShip(delta: number): void {
        const v = level.ship.v.length();
         
        // eslint-disable-next-line no-magic-numbers
        level.camera.zoom = 5 - Math.min(99, v) / 33;

        const target = level.ship.pos.add(
            level.ship.v.mul(2)
        );

        const towards = target.sub(level.camera.pos);

        if (towards.length() > 0)
        {
            level.camera.pos = level.camera.pos.add(towards.mul(delta));
        }
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
        if (currentLevel-- > 0) {
            game.stop();
            loadLevel(currentLevel);
        }
    }
}

function checkForDebugMode(): boolean {
    if (debugButton()) {
        Level.debugMode = !Level.debugMode;
    }
    return Level.debugMode;
}
