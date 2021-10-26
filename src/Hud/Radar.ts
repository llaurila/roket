import IDrawable from "../Graphics/IDrawable";
import Camera from "../Graphics/Camera";
import Ship from "../Ship";
import UniqueIdProvider from "../UniqueIdProvider";
import PhysicsEngine from "../Physics/PhysicsEngine";
import Fuel from "../Fuel";
import Body from "../Physics/Body";
import { getColorString, getColorStringFromRGBA } from "../Graphics/Color";
import { RadarDrawer } from "./RadarDrawer";
import { Config } from "../config";

const config = Config.radar;

export class Radar implements IDrawable {
    public id: number = UniqueIdProvider.next();
    private readonly _alive = true;

    private ship: Ship;
    private physics: PhysicsEngine;

    constructor(ship: Ship, physics: PhysicsEngine) {
        this.ship = ship;
        this.physics = physics;
    }

    get alive() {
        return this._alive;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        const drawer = new RadarDrawer(ctx, camera, this.ship.pos);

        ctx.save();

        drawer.drawCircle();
        this.drawNearestFuel(drawer);
        this.drawNearestShip(drawer);

        ctx.restore();
    }

    private drawNearestFuel(drawer: RadarDrawer) {
        const nearestFuel = this.getNearestFuel();

        if (nearestFuel) {
            drawer.drawDot(nearestFuel.pos, getColorString(config.fuelColor));
        }
    }

    private drawNearestShip(drawer: RadarDrawer) {
        const nearestShip = this.getNearestAlienShip();

        if (nearestShip) {
            drawer.drawDot(nearestShip.pos, getColorStringFromRGBA(1, 0, 1, 0.5));
        }
    }

    private getNearestFuel(): Body|undefined {
        return this.physics.getNearestObject(
            this.ship.pos,
            obj => obj instanceof Fuel
        );
    }

    private getNearestAlienShip(): Body|undefined {
        return this.physics.getNearestObject(
            this.ship.pos,
            obj => obj instanceof Ship && obj != this.ship
        );
    }
}
