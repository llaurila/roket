import type IDrawable from "../Graphics/IDrawable";
import type Camera from "../Graphics/Camera";
import Ship from "../Ship";
import UniqueIdProvider from "../UniqueIdProvider";
import type PhysicsEngine from "../Physics/PhysicsEngine";
import Fuel from "../Fuel";
import type Body from "../Physics/Body";
import { getColorString, getColorStringFromRGBA } from "../Graphics/Color";
import { RadarDrawer } from "./RadarDrawer";
import { Config } from "../config";

const config = Config.radar;

export class Radar implements IDrawable {
    public readonly id: number = UniqueIdProvider.next();
    public readonly alive = true;

    private ship: Ship;
    private physics: PhysicsEngine;

    public constructor(ship: Ship, physics: PhysicsEngine) {
        this.ship = ship;
        this.physics = physics;
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        if (!this.ship.alive) return;

        const drawer = new RadarDrawer(ctx, camera, this.ship.pos);

        ctx.save();

        drawer.drawCircle();
        this.drawNearestFuel(drawer, config.numberOfNearestFueldToDisplay);
        this.drawNearestShip(drawer);
        this.drawHeading(drawer);
        this.drawVector(drawer);

        ctx.restore();
    }

    private drawHeading(drawer: RadarDrawer) {
        const heading = this.ship.getHeading();
        drawer.drawTriangleMarker(
            heading,
            config.headingMarkerRadius,
            getColorString(config.headingMarkerColor)
        );
    }

    private drawVector(drawer: RadarDrawer) {
        if (this.ship.v.length() < config.minVectorMarkerVelocity) return;

        drawer.drawCircleMarker(
            this.ship.v.normalize(),
            config.vectorMarkerRadius,
            getColorString(config.vectorMarkerColor)
        );
    }

    private drawNearestFuel(drawer: RadarDrawer, count = 1) {
        const fuels = this.physics
            .filter(obj => obj instanceof Fuel)
            .map(obj => obj as Fuel)
            .sort((a, b) => a.pos.sub(this.ship.pos).length() - b.pos.sub(this.ship.pos).length());

        for (const fuel of fuels.slice(0, count)) {
            drawer.drawDot(fuel.pos, getColorString(config.fuelColor));
        }
    }

    private drawNearestShip(drawer: RadarDrawer) {
        const nearestShip = this.getNearestAlienShip();

        if (nearestShip) {
            drawer.drawDot(nearestShip.pos, getColorStringFromRGBA(1, 0, 1, 0.5));
        }
    }

    private getNearestAlienShip(): Body|undefined {
        return this.physics.getNearestObject(
            this.ship.pos,
            obj => obj instanceof Ship && obj != this.ship
        );
    }
}
