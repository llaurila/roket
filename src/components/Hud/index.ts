import { HudTexts } from "./HudTexts";
import { Radar } from "./Radar";
import { BarGauge, BarGaugeAnchor } from "./BarGauge";
import { ThrustControl } from "./ThrustControl";
import type IDrawable from "../../Graphics/IDrawable";
import UniqueIdProvider from "../../UniqueIdProvider";
import type Level from "../../Level";
import Game from "@/Game";
import type { Viewport } from "@/Graphics/Viewport";

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

    public draw(viewport: Viewport) {
        const { ctx } = viewport;

        ctx.save();
        ctx.resetTransform();

        this.radar.draw(viewport);

        this.gauges.forEach(gauge => { gauge.draw(viewport); });

        this.thrustControl.draw(viewport);

        this.texts.draw(viewport);

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
