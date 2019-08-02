import Level from "../Level";
import Cosmos from "../Cosmos";
import Vector from "../Physics/Vector";
import Fuel from "../Fuel";
import ShipController from "../ShipController";
import Objective from "../Objective";

class Introduction extends Level {
    name: string = "Level 1: Introduction";
    description: string =
`Familiarise yourself with the controls and acquire one fuel capsule.`;

    fuelCapsule: Fuel = new Fuel(Vector.Up.rotate(-0.3).mul(45));

    createObjects(): void {
        this.graphics.add(new Cosmos());

        this.physics.add(this.fuelCapsule);
        this.graphics.add(this.fuelCapsule);

        this.fuelCapsule.angularVelocity = 1;

        this.shipController = new ShipController(this.ship);
    }

    createObjectives() {
        this.objectives.push(new Objective(
            "Collect a fuel capsule.",
            () => !this.fuelCapsule.alive
        ));
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.fuelCapsule.pos.sub(this.ship.pos).length() < 8) {
            this.fuelCapsule.collect(this.ship);
        }
    }
}

export default Introduction;