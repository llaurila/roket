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
        this.registerObjectiveTest(
            "beacon1Reached",
            () => this.checkBeacon("beacon-1")
        );

        this.registerObjectiveTest(
            "beacon2Reached",
            () => this.checkBeacon("beacon-2")
        );

        this.registerObjectiveTest(
            "beacon3Reached",
            () => this.checkBeacon("beacon-3")
        );

        this.registerObjectiveTest(
            "beacon4Reached",
            () => this.checkBeacon("beacon-4")
        );

        this.registerObjectiveTest(
            "timeExceeded",
            () => this.elapsed > this.timeLimit
        );
    }

    private checkBeacon(id: string): boolean {
        const beacon = this.getObject<Beacon>(id);
        return beacon && beacon.canDetectShip(this.ship);
    }
}

export default HotLap;
