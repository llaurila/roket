import { initializeGraphics } from "./Graphics/Graphics";
import Camera from "./Graphics/Camera";

const FREQ_HZ = 60;

class Game {
    ctx: CanvasRenderingContext2D;
    updateFunc: (time: number, delta: number) => void;
    drawFunc: (ctx: CanvasRenderingContext2D, camera: Camera) => void;
    prev = 0;
    running = false;
    camera: Camera;
    startTime = 0;
    repeatingTasks: IRepeatingTask[] = [];

    constructor(
        update: (time: number, delta: number) => void,
        draw: (ctx: CanvasRenderingContext2D, camera: Camera) => void,
        camera: Camera) {

        this.ctx = initializeGraphics("game");

        this.updateFunc = update;
        this.drawFunc = draw;
        this.camera = camera;
    }

    start(): void {
        if (this.running) {
            throw new Error("Game already running.");
        }

        this.startTime = (new Date()).getTime() / 1000;

        this.running = true;
        this.prev = (new Date()).getTime();

        const gameLoop = () => {
            if (this.running) {
                window.requestAnimationFrame(gameLoop);
            }

            const time = (new Date()).getTime() / 1000;
            const delta = time - this.prev;

            const frames = Math.ceil(FREQ_HZ * delta);
            const frameDelta = delta / frames;
            for (let frame = 0; frame < frames; frame++) {
                this.updateFunc(time - this.startTime + frame * frameDelta, frameDelta);
            }

            this.drawFunc(this.ctx, this.camera);

            for (const task of this.repeatingTasks) {
                if (time - task.prevRun >= task.interval) {
                    task.prevRun = time;
                    task.func();
                }
            }

            this.prev = time;
        };

        window.requestAnimationFrame(gameLoop);
    }

    stop() {
        this.running = false;
    }

    every(interval: number, func: () => void) {
        this.repeatingTasks.push({
            interval,
            func,
            prevRun: 0
        });
    }
}

interface IRepeatingTask {
    interval: number;
    func: () => void;
    prevRun: number;
}

export default Game;
