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

    protected override getRuntimeVars(): Record<string, string> {
        return {
            timeLimit: this.timeLimit.toString()
        };
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest("beaconReached", (id: unknown, nextId: unknown) => {
            const idString = id as string;
            const beacon = this.getObject<Beacon>(idString);
            if (!beacon) throw new Error(`Beacon with id ${idString} not found.`);
            return this.testBeacon(beacon, nextId);
        });

        this.registerObjectiveTest(
            "timeExceeded",
            () => this.elapsed > this.timeLimit
        );
    }

    private testBeacon(beacon: Beacon, nextId: unknown): boolean {
        const success = beacon.canDetectShip(this.ship);

        if (success) {
            beacon.deactivate();

            if (nextId) {
                const idString = nextId as string;
                const nextBeacon = this.getObject<Beacon>(idString);

                if (nextBeacon) {
                    nextBeacon.activate();
                } else {
                    throw new Error(`Next beacon with id ${idString} not found.`);
                }
            }
        }

        return success;
    }
}

export default HotLap;
