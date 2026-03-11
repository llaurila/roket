import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import {
    getCollectedFuelCount,
    getRemainingCollectableFuelCount,
    isFuelCollectionStillPossible
} from "@/Level/fuelProgress";
import type { LevelData } from "@/Level/types";
import type Fuel from "@/Fuel";

const FUEL_IDS = ["fuel-1", "fuel-2", "fuel-3"];

class GravityHarvest extends DataLevel {
    public constructor() {
        super(data as LevelData);
    }

    public override update(time: number, delta: number): void {
        super.update(time, delta);

        if (!this.ended && !this.objectiveStillPossible()) {
            this.failure("MISSION FAILED. NOT ENOUGH FUEL CAPSULES REMAIN.");
        }
    }

    protected override getRuntimeVars(): Record<string, string> {
        return {
            ...super.getRuntimeVars(),
            collected: this.getCollectedCount().toString(),
            total: FUEL_IDS.length.toString()
        };
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest("allCollected", () =>
            FUEL_IDS.every(id => this.getObject<Fuel>(id).collected)
        );

        this.registerObjectiveTest("collectionStillPossible", () => {
            const collected = this.getCollectedCount();
            const collectableLeft = this.getRemainingCollectableCount();
            return collected + collectableLeft >= FUEL_IDS.length;
        });

        this.registerObjectiveTest("collectionImpossible", () =>
            !this.objectiveStillPossible()
        );
    }

    private getCollectedCount(): number {
        return getCollectedFuelCount(this.getFuelCapsules());
    }

    private getRemainingCollectableCount(): number {
        return getRemainingCollectableFuelCount(this.getFuelCapsules());
    }

    private objectiveStillPossible(): boolean {
        return isFuelCollectionStillPossible(this.getFuelCapsules(), FUEL_IDS.length);
    }

    private getFuelCapsules(): Fuel[] {
        return FUEL_IDS.map(id => this.getObject<Fuel>(id));
    }

}

export default GravityHarvest;
