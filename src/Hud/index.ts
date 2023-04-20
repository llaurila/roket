import IDrawable from "../Graphics/IDrawable";
import Camera from "../Graphics/Camera";
import UniqueIdProvider from "../UniqueIdProvider";
import { HudTexts } from "./HudTexts";
import { Radar } from "./Radar";
import Level from "../Level";
import { FuelGauge } from "./FuelGauge";

export class Hud implements IDrawable {
    public id: number = UniqueIdProvider.next();
    public readonly texts = new HudTexts();

    alive = true;

    private readonly radar: Radar;
    private readonly fuelGauge: FuelGauge;

    constructor(level: Level) {
        const { ship, physics } = level;
        this.radar = new Radar(ship, physics);
        this.fuelGauge = new FuelGauge(ship);
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        ctx.save();
        ctx.resetTransform();

        this.radar.draw(ctx, camera);
        this.fuelGauge.draw(ctx);
        this.texts.draw(ctx);

        ctx.restore();
    }
}
