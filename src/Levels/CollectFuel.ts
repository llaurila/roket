import Level from "../Level";
import Cosmos from "../Cosmos";
import Vector from "../Physics/Vector";
import Fuel from "../Fuel";
import ShipController from "../ShipController";
import Objective from "../Objective";
import RNG from "../RNG";

class CollectFuel extends Level {
    name: string = "Level 3: Collect Fuel";
    description: string =
`Collect all the fuel capsules revealed by the radar.`;

    fuelCapsules: Fuel[] = [];

    createObjects(): void {
        this.graphics.add(new Cosmos());
        this.generateFuelCapsules(10);
        this.shipController = new ShipController(this.ship);
    }

    generateFuelCapsules(count: number): void {
        const rng = new RNG(3287);

        for (let i = 0; i < count; i++) {
            let capsule = new Fuel(
                Vector.Up.rotate(rng.next(-Math.PI, +Math.PI)).mul(rng.next(45, 500))
            );
            capsule.angularVelocity = rng.next(-1, +1);
            this.fuelCapsules.push(capsule);
            this.addFuelCapsule(capsule);
        }
    }

    createObjectives() {
        this.objectives.push(new Objective(
            `Collect ${this.fuelCapsules.length} fuel capsules.`,
            () => !this.fuelCapsules.some(f => f.alive)
        ));
    }
}

export default CollectFuel;