import Level from "@/Level";
import Cosmos from "@/components/Cosmos";
import Vector from "@/Physics/Vector";
import Fuel from "@/Fuel";
import ShipController from "@/ShipController";
import Objective from "@/Level/Objective";

class DeepSpaceMission extends Level {
    public name = "LEVEL 4: DEEP SPACE MISSION";
    public description =
        "ACCELERATE TO HIGH VELOCITY TO COLLECT THE FAR AWAY FUEL CAPSULE AS FAST " +
        "AS POSSIBLE AND RETURN BACK TO COLLECT THE OTHER OTHER CAPSULE.";

    // eslint-disable-next-line no-magic-numbers
    public nearFuelCapsule: Fuel = new Fuel(Vector.Down.mul(44));
    // eslint-disable-next-line no-magic-numbers
    public farFuelCapsule: Fuel = new Fuel(Vector.Up.rotate(0.51).mul(100000));

    public createObjects(): void {
        this.graphics.add(new Cosmos());

        this.nearFuelCapsule.angularVelocity = -1;
        this.addFuelCapsule(this.nearFuelCapsule);

        this.farFuelCapsule.amount = 500;
        this.farFuelCapsule.angularVelocity = 1;
        this.addFuelCapsule(this.farFuelCapsule);

        this.shipController = new ShipController(this.ship);
    }

    public createObjectives() {
        this.addOrderedObjectives([
            new Objective(
                "COLLECT THE FAR FUEL CAPSULE",
                () => !this.farFuelCapsule.alive,
                () => this.nearFuelCapsule.alive ?
                    null : "FAILED TO COLLECT THE FAR FUEL CAPSULE FIRST!"
            ),
            new Objective(
                "COLLECT THE NEAR FUEL CAPSULE",
                () => !this.nearFuelCapsule.alive
            )
        ]);
    }
}

export default DeepSpaceMission;
