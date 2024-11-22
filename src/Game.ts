import { initializeGraphics } from "./Graphics/Graphics";
import type Camera from "./Graphics/Camera";
import type { Action, IRecurringTask } from "./types";
import { Config } from "./config";

class Game {
    public ctx: CanvasRenderingContext2D;
    public updateFunc: (time: number, delta: number) => void;
    public drawFunc: (ctx: CanvasRenderingContext2D, camera: Camera) => void;
    public prev = 0;
    public running = false;
    public camera: Camera;
    public startTime = 0;
    public recurringTasks: IRecurringTask[] = [];

    public constructor(
        update: (time: number, delta: number) => void,
        draw: (ctx: CanvasRenderingContext2D, camera: Camera) => void,
        camera: Camera) {

        this.ctx = initializeGraphics("game");

        this.updateFunc = update;
        this.drawFunc = draw;
        this.camera = camera;
    }

    public start(): void {
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

            this.updatePhysics(delta, time);
            this.drawFunc(this.ctx, this.camera);
            this.runRecurringTasks(time);

            this.prev = time;
        };

        window.requestAnimationFrame(gameLoop);
    }

    private updatePhysics(delta: number, time: number) {
        const frames = Math.ceil(Config.physics.updateFreqHz * delta);
        const frameDelta = delta / frames;
        for (let frame = 0; frame < frames; frame++) {
            this.updateFunc(time - this.startTime + frame * frameDelta, frameDelta);
        }
    }

    private runRecurringTasks(time: number) {
        for (const task of this.recurringTasks) {
            if (time - task.prevRun >= task.interval) {
                task.prevRun = time;
                task.func();
            }
        }
    }

    public stop() {
        this.running = false;
    }

    public every(interval: number, func: Action) {
        this.recurringTasks.push({
            interval,
            func,
            prevRun: 0
        });
    }
}

export default Game;
