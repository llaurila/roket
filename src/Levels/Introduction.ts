import Level from "../Level";
import Cosmos from "../Cosmos";
import Vector from "../Physics/Vector";
import Fuel from "../Fuel";
import ShipController from "../ShipController";
import Objective from "../Objective";

class Introduction extends Level {
    name = "LEVEL 1: INTRODUCTION";
    description =
        "FAMILIARISE YOURSELF WITH THE CONTROLS AND ACQUIRE ONE FUEL CAPSULE. " +
        "ACCELERATE (ARROW UP) TO START.";

    // eslint-disable-next-line no-magic-numbers
    fuelCapsule: Fuel = new Fuel(Vector.Up.rotate(-0.3).mul(45));

    createObjects(): void {
        this.graphics.add(new Cosmos());

        this.fuelCapsule.angularVelocity = 1;
        this.addFuelCapsule(this.fuelCapsule);

        this.shipController = new ShipController(this.ship);
    }

    createObjectives() {
        this.objectives.push(new Objective(
            "COLLECT A FUEL CAPSULE",
            () => !this.fuelCapsule.alive
        ));
    }
}

export default Introduction;
