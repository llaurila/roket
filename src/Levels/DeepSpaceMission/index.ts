import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import type Fuel from "@/Fuel";
import data from "./level.yaml";
import type { Beacon } from "@/Beacon";

class DeepSpaceMission extends DataLevel {
    public constructor() {
        super(data as LevelData);
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest("farFuelCollected",
            () => !this.getObject<Fuel>("far-fuel").alive);

        this.registerObjectiveTest("nearBeaconReached",
            () =>  this.getObject<Beacon>("near-beacon").canDetectShip(this.ship));
    }
}

export default DeepSpaceMission;
