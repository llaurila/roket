import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import {
    getCollectedFuelCount,
    isFuelCollectionStillPossible
} from "@/Level/fuelProgress";
import type { LevelData } from "@/Level/types";
import type Fuel from "@/Fuel";

const FUEL_IDS = ["fuel-a", "fuel-b"];

class LightningMineIntro extends DataLevel {
    public constructor() {
        super(data as LevelData);
    }

    public override update(time: number, delta: number): void {
        super.update(time, delta);

        if (!this.ended && !this.collectionStillPossible()) {
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
            this.getCollectedCount() >= FUEL_IDS.length
        );
    }

    private getCollectedCount(): number {
        return getCollectedFuelCount(this.getFuelCapsules());
    }

    private collectionStillPossible(): boolean {
        return isFuelCollectionStillPossible(this.getFuelCapsules(), FUEL_IDS.length);
    }

    private getFuelCapsules(): Fuel[] {
        return FUEL_IDS.map(id => this.getObject<Fuel>(id));
    }
}

export default LightningMineIntro;
