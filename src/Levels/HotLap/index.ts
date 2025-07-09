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
            () => this.getObject<Beacon>("beacon-1").canDetectShip(this.ship)
        );

        this.registerObjectiveTest(
            "beacon2Reached",
            () => this.getObject<Beacon>("beacon-2").canDetectShip(this.ship)
        );

        this.registerObjectiveTest(
            "beacon3Reached",
            () => this.getObject<Beacon>("beacon-3").canDetectShip(this.ship)
        );

        this.registerObjectiveTest(
            "beacon4Reached",
            () => this.getObject<Beacon>("beacon-4").canDetectShip(this.ship)
        );

        this.registerObjectiveTest(
            "timeExceeded",
            () => this.elapsed > this.timeLimit
        );
    }
}

export default HotLap;
