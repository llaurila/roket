import Game from './Game';
import Camera from './Graphics/Camera';
import Keys from './Controls/Keys';
import GameController from './Controls/GameController';
import Level from './Level';
import Introduction from './Levels/Introduction';
import VelocityControl from './Levels/VelocityControl';
import CollectFuel from './Levels/CollectFuel';
import GameOfTag from './Levels/GameOfTag';

const levelTypes = [
    Introduction,
    VelocityControl,
    CollectFuel,
    GameOfTag
];

let currentLevel = 0;
loadLevel(currentLevel);

function loadLevel(number: number) {
    let level: Level = new levelTypes[number];
    level.constructor.apply(level);
    
    const game = new Game(update, draw, level.camera);

    level.init(game.ctx, number);

    game.every(1, () => {
        level.physics.cleanUp();
        level.graphics.cleanUp();
    });

    game.start();

    function update(time: number, delta: number) {
        if (continueButton() && level.passed) {
            if (++currentLevel < levelTypes.length) {
                game.stop();
                loadLevel(currentLevel);    
            }
        }

        if (restartButton()) {
            game.stop();
            loadLevel(currentLevel);
        }

        if (debugButton()) {
            Level.debugMode = !Level.debugMode;
        }

        if (Level.debugMode) {
            if (nextLevelButton()) {
                if (++currentLevel < levelTypes.length) {
                    game.stop();
                    loadLevel(currentLevel);    
                }   
            }

            if (previousLevelButton()) {
                if (currentLevel-- > 0) {
                    game.stop();
                    loadLevel(currentLevel);    
                }   
            }            
        }

        if (level.shipController) {
            level.shipController.control();
        }

        level.update(time, delta);

        panTowardsShip(delta);
    }

    function draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;

        ctx.save();
        ctx.transform(1, 0, 0, -1, 0, ctx.canvas.height)

        level.graphics.draw(ctx, camera);
        
        ctx.restore();
    }

    function panTowardsShip(delta: number): void {
        const v = level.ship.v.length();
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

    const restartButton = () => Keys.wasPressed(27) || GameController.wasPressed(9);
    const continueButton = () => Keys.wasPressed(13) || GameController.wasPressed(0);
    const debugButton = () => Keys.wasPressed(68);
    const nextLevelButton = () => Keys.wasPressed(76);
    const previousLevelButton = () => Keys.wasPressed(75);
}
