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
        this.registerSuccessCheck(
            "fast", () => this.ship.v.length() >= this.highSpeedThreshold
        );

        this.registerSuccessCheck(
            "slow", () => this.ship.v.length() < this.lowSpeedThreshold
        );
    }
}

export default VelocityControl;
