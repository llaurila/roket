import data from "./level.yaml";
import CollectFuel from "@/Levels/CollectFuel";
import Meteor from "@/Meteor";
import type { LevelData } from "@/Level/types";

class MeteorField extends CollectFuel {
    public meteors: Meteor[] = [];

    private readonly meteorCount: number;

    public constructor() {
        super(data as LevelData);
        this.meteorCount = this.getEnv<number>("METEOR_COUNT");
    }

    public override createObjects(): void {
        super.createObjects();
        this.generateMeteors(this.meteorCount);
    }

    public generateMeteors(count: number): void {
        const meteorDistanceMin = this.getEnv<number>("METEOR_DISTANCE_MIN");
        const meteorDistanceMax = this.getEnv<number>("METEOR_DISTANCE_MAX");

        for (let i = 0; i < count; i++) {
            const meteor = new Meteor(this.getRandomPosition(
                meteorDistanceMin,
                meteorDistanceMax
            ), {
                diameter: this.rng.next(12, 20),
                mass: this.rng.next(14, 24),
                angularVelocity: this.rng.next(-0.35, 0.35)
            }, this.rng);

            this.meteors.push(meteor);
            this.addMeteor(meteor);
        }
    }
}

export default MeteorField;