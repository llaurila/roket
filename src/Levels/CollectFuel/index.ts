import data from "./level.yaml";
import Vector from "../../Physics/Vector";
import Fuel from "../../Fuel";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import { globalSoundEffects } from "@/Sounds/global-sound-effects";

class CollectFuel extends DataLevel {
    public fuelCapsules: Fuel[] = [];

    private readonly fuelCapsuleCount: number;

    public constructor() {
        super(data as LevelData);
        this.fuelCapsuleCount = this.getEnv<number>("FUEL_CAPSULE_COUNT");
    }

    public createObjects(): void {
        super.createObjects();
        this.generateFuelCapsules(this.fuelCapsuleCount);
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
                globalSoundEffects.playNotificationSound();
            });

            capsule.angularVelocity = rng.next(-1, +1);
            this.fuelCapsules.push(capsule);
            this.addFuelCapsule(capsule);
        }
    }

    protected override getRuntimeVars(): Record<string, string> {
        return {
            ...super.getRuntimeVars(),
            collected: this.getCollectedFuelCapsuleCount().toString(),
            total: this.fuelCapsuleCount.toString()
        };
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest("allCollected", () =>
            this.fuelCapsules.every(f => !f.alive)
        );
    }

    private getCollectedFuelCapsuleCount(): number {
        return this.fuelCapsules.filter(f => !f.alive).length;
    }
}

export default CollectFuel;
