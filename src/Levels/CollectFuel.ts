import Level from "../Level";
import Cosmos from "../Cosmos";
import Vector from "../Physics/Vector";
import Fuel from "../Fuel";
import ShipController from "../ShipController";
import Objective from "../Objective";
import RNG from "../RNG";

const RAND_SEED = 3287;
const FUEL_CAPSULE_COUNT = 6;
const FUEL_CAPSULE_DISTANCE_MIN = 45;
const FUEL_CAPSULE_DISTANCE_MAX = 500;

class CollectFuel extends Level {
    name = "LEVEL 3: COLLECT FUEL";
    description =
        "COLLECT ALL THE FUEL CAPSULES REVEALED BY THE RADAR.";

    fuelCapsules: Fuel[] = [];

    createObjects(): void {
        this.graphics.add(new Cosmos());
        this.generateFuelCapsules(FUEL_CAPSULE_COUNT);
        this.shipController = new ShipController(this.ship);
    }

    generateFuelCapsules(count: number): void {
        const rng = new RNG(RAND_SEED);

        for (let i = 0; i < count; i++) {
            const capsule = new Fuel(
                Vector.Up.rotate(rng.next(-Math.PI, +Math.PI))
                    .mul(rng.next(
                        FUEL_CAPSULE_DISTANCE_MIN, FUEL_CAPSULE_DISTANCE_MAX))
            );
            capsule.angularVelocity = rng.next(-1, +1);
            this.fuelCapsules.push(capsule);
            this.addFuelCapsule(capsule);
        }
    }

    createObjectives() {
        this.objectives.push(new Objective(
            `COLLECT ${this.fuelCapsules.length} FUEL CAPSULES.`,
            () => !this.fuelCapsules.some(f => f.alive)
        ));
    }
}

export default CollectFuel;
