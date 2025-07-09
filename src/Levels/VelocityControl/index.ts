import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";

class VelocityControl extends DataLevel {
    private readonly highSpeedThreshold: number;
    private readonly lowSpeedThreshold: number;

    public constructor() {
        super(data as LevelData);

        this.highSpeedThreshold = this.getEnv<number>("HIGH_SPEED_THRESHOLD");
        this.lowSpeedThreshold = this.getEnv<number>("LOW_SPEED_THRESHOLD");
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest(
            "fast", () => this.ship.v.length() >= this.highSpeedThreshold
        );

        this.registerObjectiveTest(
            "slow", () => this.ship.v.length() < this.lowSpeedThreshold
        );
    }

    protected override getRuntimeVars(): Record<string, string> {
        return {
            thresholdHigh: this.highSpeedThreshold.toString(),
            thresholdLow: this.lowSpeedThreshold.toString(),
        };
    }
}

export default VelocityControl;
