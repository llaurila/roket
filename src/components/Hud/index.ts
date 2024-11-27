import { HudTexts } from "./HudTexts";
import { Radar } from "./Radar";
import { BarGauge, BarGaugeAnchor } from "./BarGauge";
import { ThrustControl } from "./ThrustControl";
import type IDrawable from "../../Graphics/IDrawable";
import UniqueIdProvider from "../../UniqueIdProvider";
import type Level from "../../Level";
import type Camera from "../../Graphics/Camera";
import Game from "../../Game";

export class Hud implements IDrawable {
    public id: number = UniqueIdProvider.next();
    public readonly texts = new HudTexts();

    public alive = true;

    private readonly radar: Radar;
    private readonly gauges: BarGauge[] = [];
    private readonly thrustControl: ThrustControl;

    public constructor(level: Level) {
        const { ship, physics } = level;
        this.radar = new Radar(ship, physics);

        this.addFakeGauges();

        this.gauges.push(new BarGauge(
            () => `FUEL (${Math.round(ship.fuelTank.getMass())} KG)`,
            () => ship.fuelTank.currentAmount,
            () => ship.fuelTank.capacity,
            BarGaugeAnchor.Bottom,
            1
        ));

        this.gauges.push(new BarGauge(
            "HULL INTEGRITY",
            () => ship.hullIntegrity,
            () => 1,
            BarGaugeAnchor.Bottom,
            0
        ));

        this.thrustControl = new ThrustControl(ship);
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        ctx.save();
        ctx.resetTransform();

        this.radar.draw(ctx, camera);

        this.gauges.forEach(gauge => { gauge.draw(ctx); });

        this.thrustControl.draw(ctx, camera);

        this.texts.draw(ctx);

        ctx.restore();
    }

    private addFakeGauges() {
        if (!Game.debugMode) return;

        const shieldsMax = Math.random() * .5 + .5;
        const weaponsMax = .5 + (1 - shieldsMax) * Math.random();
        const enginesMax = .5 + (1 - weaponsMax) * Math.random();

        this.gauges.push(new BarGauge(
            "SHIELDS",
            () => shieldsMax,
            () => 1,
            BarGaugeAnchor.Top,
            0
        ));

        this.gauges.push(new BarGauge(
            "WEAPONS",
            () => weaponsMax,
            () => 1,
            BarGaugeAnchor.Top,
            1
        ));

        this.gauges.push(new BarGauge(
            "ENGINES",
            () => enginesMax,
            () => 1,
            BarGaugeAnchor.Top,
            2
        ));
    }
}
