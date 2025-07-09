import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import type { Beacon } from "@/Beacon";

class HotLap extends DataLevel {
    private elapsed = 0;
    private readonly timeLimit: number;

    public constructor() {
        super(data as LevelData);
        this.timeLimit = this.getEnv<number>("TIME_LIMIT");
    }

    public update(time: number, delta: number) {
        super.update(time, delta);
        this.elapsed = time;
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest("beaconReached", (id: string) =>
            this.getObject<Beacon>(id).canDetectShip(this.ship)
        );
    }
}

export default HotLap;
