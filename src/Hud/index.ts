import type IDrawable from "../Graphics/IDrawable";
import type Camera from "../Graphics/Camera";
import UniqueIdProvider from "../UniqueIdProvider";
import { HudTexts } from "./HudTexts";
import { Radar } from "./Radar";
import type Level from "../Level";
import { FuelGauge } from "./FuelGauge";

export class Hud implements IDrawable {
    public id: number = UniqueIdProvider.next();
    public readonly texts = new HudTexts();

    public alive = true;

    private readonly radar: Radar;
    private readonly fuelGauge: FuelGauge;

    public constructor(level: Level) {
        const { ship, physics } = level;
        this.radar = new Radar(ship, physics);
        this.fuelGauge = new FuelGauge(ship);
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        ctx.save();
        ctx.resetTransform();

        this.radar.draw(ctx, camera);
        this.fuelGauge.draw(ctx);
        this.texts.draw(ctx);

        ctx.restore();
    }
}
