import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import Ship from "@/Ship";
import Vector from "@/Physics/Vector";
import NPCAIController, { type NPCAIControllerConfig } from "../NPCAIController";
import Fuel from "@/Fuel";
import { Config } from "@/config";
import type { IColor } from "@/Graphics/Color";
import { degToRad } from "@/Utils";

class FuelRush extends DataLevel {
    public enemy: Ship;
    public ai?: NPCAIController;
    public fuelCapsules: Fuel[] = [];
    public started = false;

    private playerScore = 0;
    private enemyScore = 0;
    private enemyTarget?: Vector;

    private readonly fuelCapsuleCount: number;
    private readonly otherShipOffset: Vector;
    private readonly fuelCapsuleDistanceMin: number;
    private readonly fuelCapsuleDistanceMax: number;
    private readonly aiConfig: NPCAIControllerConfig;

    public constructor() {
        super(data as LevelData);

        this.fuelCapsuleCount = this.getEnv<number>("FUEL_CAPSULE_COUNT");
        this.otherShipOffset = Vector.fromComponents(
            this.getEnv<number[]>("OTHER_SHIP_OFFSET")
        );
        this.fuelCapsuleDistanceMin = this.getEnv<number>("FUEL_CAPSULE_DISTANCE_MIN");
        this.fuelCapsuleDistanceMax = this.getEnv<number>("FUEL_CAPSULE_DISTANCE_MAX");

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

    public createObjects(): void {
        super.createObjects();

        this.physics.add(this.enemy);
        this.graphics.add(this.enemy);

        this.enemy.mass = Config.ship.mass;
        this.enemy.rotation = this.getEnv<number>("OTHER_SHIP_HEADING");

        this.enemy.onCollision(e => {
            if (e.target == this.ship) {
                if (!this.ship.hasShield()) {
                    this.ship.die();
                }
            }
        });

        this.generateFuelCapsules(this.fuelCapsuleCount);

        this.ai = new NPCAIController(this.enemy, this.aiConfig);
    }

    public update(time: number, delta: number) {
        super.update(time, delta);

        if (this.started) {
            const target = this.getEnemyTarget();
            this.ai?.setTarget({ pos: target, v: Vector.Zero });
            this.ai?.control();
        }
        else {
            this.startNpcWhenPlayerMoves();
        }
    }

    protected override getRuntimeVars(): Record<string, string> {
        return {
            ...super.getRuntimeVars(),
            playerScore: this.playerScore.toString(),
            enemyScore: this.enemyScore.toString(),
            total: this.fuelCapsuleCount.toString()
        };
    }

    protected registerObjectiveChecks(): void {
        const half = this.fuelCapsuleCount / 2;

        this.registerObjectiveTest(
            "playerWon",
            () => this.playerScore > half
        );

        this.registerObjectiveTest(
            "playerLost",
            () => this.enemyScore >= half
        );
    }

    private generateFuelCapsules(count: number): void {
        const { rng } = this;

        for (let i = 0; i < count; i++) {
            const fuel = new Fuel(
                Vector.Up.rotate(rng.next(-Math.PI, Math.PI))
                    .mul(rng.next(
                        this.fuelCapsuleDistanceMin,
                        this.fuelCapsuleDistanceMax
                    ))
            );

            fuel.angularVelocity = rng.next(-1, 1);

            fuel.onCollision(e => {
                this.enemyTarget = undefined;

                if (fuel.collected) return;

                if (e.target == this.ship) {
                    this.playerScore++;
                } else if (e.target == this.enemy) {
                    this.enemyScore++;
                    fuel.collect(this.enemy);
                }
            });

            this.addFuelCapsule(fuel);
            this.fuelCapsules.push(fuel);
        }
    }

    private getEnemyTarget(): Vector {
        if (this.enemyTarget) {
            return this.enemyTarget;
        }

        const nearestFuel = this.getNearestEnemyFuel();
        if (nearestFuel) {
            this.enemyTarget = nearestFuel.pos;
            return this.enemyTarget;
        }

        return Vector.Zero;
    }

    private getNearestEnemyFuel(): Fuel | undefined {
        let nearest: Fuel | undefined;
        let minDist = Infinity;

        for (const fuel of this.fuelCapsules) {
            if (!fuel.alive) continue;
            const d = fuel.pos.distanceTo(this.enemy.pos);
            if (d < minDist) {
                minDist = d;
                nearest = fuel;
            }
        }

        return nearest;
    }

    private startNpcWhenPlayerMoves() {
        const INITIAL_SPEED = 10;

        if (this.ship.v.length() > 0) {
            this.enemy.v = this.enemy.getHeading().mul(INITIAL_SPEED);
            this.started = true;
        }
    }
}

export default FuelRush;
