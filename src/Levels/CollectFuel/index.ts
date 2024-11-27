import Level from "../../Level";
import Cosmos from "../../components/Cosmos";
import Vector from "../../Physics/Vector";
import Fuel from "../../Fuel";
import ShipController from "../../ShipController";
import Objective from "../../Level/Objective";
import RNG from "../../RNG";
import { Config } from "../../config";
import { playNotificationSound } from "../../Sounds";

const RAND_SEED = 3287;
const FUEL_CAPSULE_COUNT = 6;
const FUEL_CAPSULE_DISTANCE_MIN = 45;
const FUEL_CAPSULE_DISTANCE_MAX = 500;

class CollectFuel extends Level {
    public name = "LEVEL 3: COLLECT FUEL";
    public description = "COLLECT ALL THE FUEL CAPSULES REVEALED BY THE RADAR " +
        `(${FUEL_CAPSULE_COUNT} IN TOTAL). THE RADAR WILL SHOW YOU THE ` +
        `${Config.radar.numberOfNearestFueldToDisplay} CLOSEST CAPSULES AT ALL TIMES.`;

    public fuelCapsules: Fuel[] = [];

    public createObjects(): void {
        this.graphics.add(new Cosmos());
        this.generateFuelCapsules(FUEL_CAPSULE_COUNT);
        this.ship.fuelTank.currentAmount = 150;
        this.shipController = new ShipController(this.ship);
    }

    public generateFuelCapsules(count: number): void {
        const rng = new RNG(RAND_SEED);

        for (let i = 0; i < count; i++) {
            const capsule = new Fuel(
                Vector.Up.rotate(rng.next(-Math.PI, +Math.PI))
                    .mul(rng.next(
                        FUEL_CAPSULE_DISTANCE_MIN, FUEL_CAPSULE_DISTANCE_MAX))
            );

            capsule.addEventListener("collect", () => {
                playNotificationSound();
            });

            capsule.angularVelocity = rng.next(-1, +1);
            this.fuelCapsules.push(capsule);
            this.addFuelCapsule(capsule);
        }
    }

    public collected = () =>
        this.fuelCapsules.length - this.fuelCapsules.filter(f => f.alive).length;

    public createObjectives() {
        const total = this.fuelCapsules.length;

        this.objectives.push(new Objective(
            () => `COLLECT FUEL CAPSULES (${this.collected()} OF ${total})`,
            () => !this.fuelCapsules.some(f => f.alive)
        ));
    }
}

export default CollectFuel;
