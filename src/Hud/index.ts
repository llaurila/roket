import IDrawable from "../Graphics/IDrawable";
import Camera from "../Graphics/Camera";
import Ship from "../Ship";
import UniqueIdProvider from "../UniqueIdProvider";
import PhysicsEngine from "../Physics/PhysicsEngine";
import { HudTexts } from "./HudTexts";
import { Radar } from "./Radar";

export class Hud implements IDrawable {
    public id: number = UniqueIdProvider.next();
    public readonly texts = new HudTexts();

    private readonly _alive = true;

    private readonly radar: Radar;

    constructor(ship: Ship, physics: PhysicsEngine) {
        this.radar = new Radar(ship, physics);
    }

    get alive() {
        return this._alive;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        ctx.save();
        ctx.resetTransform();

        this.radar.draw(ctx, camera);
        this.texts.draw(ctx);

        ctx.restore();
    }
}
