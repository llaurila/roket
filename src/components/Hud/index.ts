import { HudTexts } from "./HudTexts";
import { Radar } from "./Radar";
import { BarGauge, BarGaugeAnchor } from "./BarGauge";
import { ThrustControl } from "./ThrustControl";
import type IDrawable from "../../Graphics/IDrawable";
import UniqueIdProvider from "../../UniqueIdProvider";
import type Level from "../../Level";
import type { Viewport } from "@/Graphics/Viewport";

export class Hud implements IDrawable {
    public id: number = UniqueIdProvider.next();
    public readonly texts = new HudTexts();

    public alive = true;

    private readonly ship: Level["ship"];
    private readonly radar: Radar;
    private readonly gauges: BarGauge[] = [];
    private readonly weaponGauges: BarGauge[] = [];
    private readonly thrustControl: ThrustControl;

    public constructor(level: Level) {
        const { ship, physics } = level;
        this.ship = ship;
        this.radar = new Radar(ship, physics);

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

        this.addWeaponGauges();

        this.radar.draw(viewport);

        this.weaponGauges.forEach(gauge => { gauge.draw(viewport); });

        this.gauges.forEach(gauge => { gauge.draw(viewport); });

        this.thrustControl.draw(viewport);

        this.texts.draw(viewport);

        ctx.restore();
    }

    private addWeaponGauges() {
        if (this.weaponGauges.length > 0 || this.ship.weapons.length == 0) {
            return;
        }

        const weaponsWithGauge = this.ship.weapons
            .map(weapon => ({
                weapon,
                getGauge: () => weapon.getHudGauge()
            }))
            .filter(({ getGauge }) => getGauge() != null);

        weaponsWithGauge.forEach(({ weapon, getGauge }, index) => {
            this.weaponGauges.push(new BarGauge(
                () => getGauge()?.caption ?? weapon.type.toUpperCase(),
                () => getGauge()?.current ?? 0,
                () => Math.max(getGauge()?.max ?? 0, 1),
                BarGaugeAnchor.Top,
                index
            ));
        });
    }
}
