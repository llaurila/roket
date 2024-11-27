import type Fuel from "../../Fuel";
import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";

class Introduction extends DataLevel {
    public constructor() {
        super(data as LevelData);
    }

    protected registerObjectiveChecks(): void {
        this.registerSuccessCheck("fuelCollected", () => !this.getObject<Fuel>("fuel").alive);
    }
}

export default Introduction;
