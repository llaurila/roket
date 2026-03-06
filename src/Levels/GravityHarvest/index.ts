import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import type Fuel from "@/Fuel";

const FUEL_IDS = ["fuel-1", "fuel-2", "fuel-3"];

class GravityHarvest extends DataLevel {
    public constructor() {
        super(data as LevelData);
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
            FUEL_IDS.every(id => !this.getObject<Fuel>(id).alive)
        );
    }

    private getCollectedCount(): number {
        return FUEL_IDS.filter(id => !this.getObject<Fuel>(id).alive).length;
    }
}

export default GravityHarvest;