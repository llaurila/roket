import DataLevel from "@/Level/DataLevel";
import { isFuelCollectionStillPossible } from "@/Level/fuelProgress";
import type { LevelData } from "@/Level/types";
import type Fuel from "@/Fuel";
import data from "./level.yaml";
import type { Beacon } from "@/Beacon";

class DeepSpaceMission extends DataLevel {
    private static readonly FAR_FUEL_ID = "far-fuel";

    public constructor() {
        super(data as LevelData);
    }

    public override update(time: number, delta: number): void {
        super.update(time, delta);

        if (!this.ended && !this.isFarFuelCollectable()) {
            this.failure("MISSION FAILED. NOT ENOUGH FUEL CAPSULES REMAIN.");
        }
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest("farFuelCollected",
            () => this.getFarFuel().collected);

        this.registerObjectiveTest("nearBeaconReached",
            () =>  this.getObject<Beacon>("near-beacon").canDetectShip(this.ship));
    }

    private getFarFuel(): Fuel {
        return this.getObject<Fuel>(DeepSpaceMission.FAR_FUEL_ID);
    }

    private isFarFuelCollectable(): boolean {
        return isFuelCollectionStillPossible([this.getFarFuel()], 1);
    }
}

export default DeepSpaceMission;
