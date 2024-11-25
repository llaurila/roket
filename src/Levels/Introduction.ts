import Level from "../Level";
import Cosmos from "../Cosmos";
import Vector from "../Physics/Vector";
import Fuel from "../Fuel";
import ShipController from "../ShipController";
import Objective from "../Objective";

class Introduction extends Level {
    public name = "LEVEL 1: INTRODUCTION";
    public description =
        "FAMILIARISE YOURSELF WITH THE CONTROLS AND ACQUIRE ONE FUEL CAPSULE. " +
        "ACCELERATE (PRESS <UP> KEY) TO START.\n" +
        "\n" +
        "<LEFT> AND <RIGHT> KEYS FIRE THE " +
        "THRUSTERS SEPARATELY AND <SHIFT> KEY REDUCES THRUST POWER FOR FINER " +
        "CONTROL";

    // eslint-disable-next-line no-magic-numbers
    public fuelCapsule: Fuel = new Fuel(Vector.Up.rotate(-0.3).mul(45));

    public createObjects(): void {
        this.graphics.add(new Cosmos());

        this.fuelCapsule.angularVelocity = 1;
        this.addFuelCapsule(this.fuelCapsule);

        this.ship.fuelTank.currentAmount = 150;

        this.shipController = new ShipController(this.ship);
    }

    public createObjectives() {
        this.objectives.push(new Objective(
            "COLLECT A FUEL CAPSULE",
            () => !this.fuelCapsule.alive
        ));
    }
}

export default Introduction;
