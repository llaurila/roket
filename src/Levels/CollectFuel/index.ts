import data from "./level.yaml";
import Vector from "../../Physics/Vector";
import Fuel from "../../Fuel";
import { playNotificationSound } from "../../Sounds";
import DataLevel from "@/Level/DataLevel";
import { LevelData } from "@/Level/types";

class CollectFuel extends DataLevel {
    public fuelCapsules: Fuel[] = [];

    public constructor() {
        super(data as LevelData);
    }

    public createObjects(): void {
        super.createObjects();
        this.generateFuelCapsules(this.getEnv("FUEL_CAPSULE_COUNT"));
    }

    public generateFuelCapsules(count: number): void {
        const FUEL_CAPSULE_DISTANCE_MIN = this.getEnv<number>("FUEL_CAPSULE_DISTANCE_MIN");
        const FUEL_CAPSULE_DISTANCE_MAX = this.getEnv<number>("FUEL_CAPSULE_DISTANCE_MAX");

        const { rng } = this;

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

    protected registerObjectiveChecks(): void {
        this.registerSuccessCheck("allCollected", () =>
            this.fuelCapsules.every(f => !f.alive)
        );
    }
}

export default CollectFuel;
