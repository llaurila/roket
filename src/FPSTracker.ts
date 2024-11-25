export class FPSTracker {
    private frames = 0;
    private lastUpdate = 0;
    private _fps = 0;

    constructor(private updateInterval: number) {
        this.lastUpdate = (new Date()).getTime() / 1000;
    }

    public get currentFps() {
        return this._fps;
    }

    public registerFrame(): void {
        this.frames++;

        const time = (new Date()).getTime() / 1000;
        const delta = time - this.lastUpdate;
        
        if (delta >= this.updateInterval) {
            this._fps = this.frames / delta;
            this.frames = 0;
            this.lastUpdate = time;
        }
    }
}
