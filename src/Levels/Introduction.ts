import Level from "../Level";
import Cosmos from "../Cosmos";
import Vector from "../Physics/Vector";
import Fuel from "../Fuel";
import { Hud } from "../Hud";
import Pointer from "../Controls/Pointer";
import ShipController from "../ShipController";

class Level001 extends Level {
    name: string = "Level 1: Introduction";
    description: string =
`Familiarise yourself with the controls and acquire one fuel capsule.`;

    fuelCapsule: Fuel = new Fuel(Vector.Up.rotate(-0.3).mul(45));

    createObjects(): void {
        this.graphics.add(new Cosmos());

        this.physics.add(this.fuelCapsule);
        this.graphics.add(this.fuelCapsule);

        const hud = new Hud(this.ship, this.fuelCapsule);

        //hud.items.push(() => `Altitude: ${ship.pos.y.toFixed(0)} m`);
        hud.add(() => `Velocity: ${this.ship.v.length().toFixed(1)} m/s`);
        hud.add(() => `Fuel: ${(this.ship.fuelTank.currentAmount / this.ship.fuelTank.capacity * 100).toFixed()}% (${this.ship.fuelTank.currentAmount.toFixed()} kg)`);
        hud.add(() => `Thrusters: ${this.ship.getThrusterStatus()}`, () => Level.debugMode);
        hud.add(() => `Physics: ${this.physics.count}`, () => Level.debugMode);
        hud.add(() => `Graphics: ${this.graphics.count}`, () => Level.debugMode);

        hud.add(() => {
            const screen = Pointer.getPosition();
            const world = this.camera.toWorldCoordinates(this.ctx, screen);
            return `Mouse: ${screen} (screen) ${world} (world)`;
        }, () => Level.debugMode);

        this.graphics.add(hud);

        this.fuelCapsule.angularVelocity = 1;

        this.shipController = new ShipController(this.ship);
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.fuelCapsule.pos.sub(this.ship.pos).length() < 8) {
            this.fuelCapsule.collect(this.ship);
        }
    }
}

export default Level001;