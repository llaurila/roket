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

        this.fuelCapsule.angularVelocity = 1;
        this.addFuelCapsule(this.fuelCapsule);

        this.shipController = new ShipController(this.ship);
    }

    createObjectives() {
        this.objectives.push(new Objective(
            "Collect a fuel capsule.",
            () => !this.fuelCapsule.alive
        ));
    }
}

export default Introduction;