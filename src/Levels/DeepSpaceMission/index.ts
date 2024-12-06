import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import type Fuel from "@/Fuel";
import data from "./level.yaml";

class DeepSpaceMission extends DataLevel {
    public constructor() {
        super(data as LevelData);
    }

    protected registerObjectiveChecks(): void {
        const fuelCollectedCheck = (id: string) => () => !this.getObject<Fuel>(id).alive;
        this.registerObjectiveTest("farFuelCollected", fuelCollectedCheck("far-fuel"));
        this.registerObjectiveTest("nearFuelCollected", fuelCollectedCheck("near-fuel"));
    }
}

export default DeepSpaceMission;
