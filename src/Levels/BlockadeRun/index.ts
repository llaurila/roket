import data from "./level.yaml";
import CollectFuel from "@/Levels/CollectFuel";
import type { LevelData } from "@/Level/types";
import Ship from "@/Ship";
import Vector from "@/Physics/Vector";
import NPCAIController, { type NPCAIControllerConfig } from "@/Levels/NPCAIController";
import { Config } from "@/config";
import type { IColor } from "@/Graphics/Color";
import { degToRad } from "@/Utils";

class BlockadeRun extends CollectFuel {
    public enemy: Ship;
    public ai?: NPCAIController;
    public started = false;

    private readonly requiredFuelCapsules: number;
    private readonly otherShipOffset: Vector;
    private readonly otherShipHeading: number;
    private readonly aiConfig: NPCAIControllerConfig;

    public constructor() {
        super(data as LevelData);

        this.requiredFuelCapsules = this.getEnv<number>("REQUIRED_FUEL_CAPSULES");
        this.otherShipOffset = Vector.fromComponents(
            this.getEnv<number[]>("OTHER_SHIP_OFFSET")
        );
        this.otherShipHeading = this.getEnv<number>("OTHER_SHIP_HEADING");

        this.aiConfig = {
            arriveRadius: this.getEnv<number>("AI_ARRIVE_RADIUS"),
            arriveSpeed: this.getEnv<number>("AI_ARRIVE_SPEED"),
            maxClosingSpeed: this.getEnv<number>("AI_MAX_CLOSING_SPEED"),
            positionGain: this.getEnv<number>("AI_POSITION_GAIN"),
            velocityGain: this.getEnv<number>("AI_VELOCITY_GAIN"),
            stopVelocityGain: this.getEnv<number>("AI_STOP_VELOCITY_GAIN"),
            maxPositionAcceleration: this.getEnv<number>("AI_MAX_POSITION_ACCELERATION"),
            headingGain: this.getEnv<number>("AI_HEADING_GAIN"),
            angularDamping: this.getEnv<number>("AI_ANGULAR_DAMPING"),
            maxThrustAngle: degToRad(this.getEnv<number>("AI_MAX_THRUST_ANGLE_DEG")),
            alignmentExponent: this.getEnv<number>("AI_ALIGNMENT_EXPONENT"),
            turnThrottlePenalty: this.getEnv<number>("AI_TURN_THROTTLE_PENALTY"),
        };

        this.enemy = new Ship(this.otherShipOffset);
        this.enemy.color = this.getEnv<IColor>("ENEMY_COLOR");
    }

    public override createObjects(): void {
        super.createObjects();

        this.physics.add(this.enemy);
        this.graphics.add(this.enemy);

        this.enemy.mass = Config.ship.mass;
        this.enemy.rotation = this.otherShipHeading;

        this.enemy.onCollision(e => {
            if (e.target == this.ship) {
                if (!this.ship.hasShield()) {
                    this.ship.die();
                }
            }
        });

        this.ai = new NPCAIController(this.enemy, this.aiConfig);
    }

    public override update(time: number, delta: number): void {
        super.update(time, delta);

        if (this.shouldStopGuard()) {
            this.ai?.stop();
            return;
        }

        if (this.started) {
            this.updateGuardPursuit();
            return;
        }

        this.startNpcWhenPlayerMoves();
    }

    protected override getRuntimeVars(): Record<string, string> {
        return {
            ...super.getRuntimeVars(),
            required: this.requiredFuelCapsules.toString()
        };
    }

    protected override registerObjectiveChecks(): void {
        this.registerObjectiveTest("fuelTargetReached", () =>
            this.getCollectedFuelCapsuleCount() >= this.requiredFuelCapsules
        );
    }

    protected override requiredCollectedForSuccess(): number {
        return this.requiredFuelCapsules;
    }

    private shouldStopGuard(): boolean {
        return !this.enemy.alive || !this.ship.alive || this.ended;
    }

    private startNpcWhenPlayerMoves(): void {
        const initialSpeed = 10;

        if (this.ship.v.length() > 0) {
            this.enemy.v = this.enemy.getHeading().mul(initialSpeed);
            this.started = true;
        }
    }

    private updateGuardPursuit(): void {
        if (!this.ai) {
            return;
        }

        this.ai.setTarget({
            pos: this.ship.pos,
            v: this.ship.v
        });
        this.ai.control();
    }
}

export default BlockadeRun;
