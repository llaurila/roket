import { initializeGraphics } from './Graphics';
import Camera from './Camera';

const FREQ_HZ = 60;

class Game {
    ctx: CanvasRenderingContext2D;
    updateFunc: (time: number, delta: number) => void;
    drawFunc: (ctx: CanvasRenderingContext2D, camera: Camera) => void;
    prev: number = 0;
    running: boolean = false;
    camera: Camera;
    startTime: number = 0;

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

            this.prev = time;            
        }

        window.requestAnimationFrame(gameLoop);
    }
    
    stop() {
        this.running = false;
    }
}

export default Game;