
import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import Ship from "@/Ship";
import { Config } from "@/config";
import { generateFuelCapsule } from "./fuel";
import NPCAIController, { type NPCAIControllerConfig } from "../NPCAIController";
import Vector from "@/Physics/Vector";
import type Fuel from "@/Fuel";
import type { IColor } from "@/Graphics/Color";
import { degToRad } from "@/Utils";

class GameOfTag extends DataLevel {
    public enemy: Ship;
    public ai?: NPCAIController;

    public started = false;
    public caught = false;

    private fuel?: Fuel;

    private readonly otherShipOffset: Vector;
    private readonly fuelCapsuleDistanceMin: number;
    private readonly fuelCapsuleDistanceMax: number;
    private readonly aiConfig: NPCAIControllerConfig;

    public constructor() {
        super(data as LevelData);

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
        this.enemy.rotation = 2;

        this.enemy.onCollision(e => {
            if (!this.caught && e.target == this.ship) {
                this.caught = true;
                this.enemy.die();
            }
        });

        this.ai = new NPCAIController(this.enemy, this.aiConfig);

        this.generateNewFuelCapsule();
    }

    public generateNewFuelCapsule() {
        const fuel = generateFuelCapsule(
            this.ship.pos,
            this.rng,
            this.fuelCapsuleDistanceMin,
            this.fuelCapsuleDistanceMax
        );

        fuel.onCollision(e => {
            if (!fuel.collected && e.target == this.ship) {
                this.generateNewFuelCapsule();
            }
        });

        this.addFuelCapsule(fuel);

        this.fuel = fuel;
    }

    public update(time: number, delta: number) {
        super.update(time, delta);

        if (this.started) {
            this.updateNpcPursuit();
            return;
        }

        this.startNpcWhenPlayerMoves();
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest("caught", () => this.caught);
    }

    private startNpcWhenPlayerMoves() {
        const INITIAL_SPEED = 10;

        if (this.ship.v.length() > 0) {
            this.enemy.v = this.enemy.getHeading().mul(INITIAL_SPEED);
            this.started = true;
        }
    }

    private updateNpcPursuit(): void {
        if (!this.ai) {
            return;
        }

        const fuelPosition = this.fuel ? this.fuel.pos : Vector.Zero;
        const interceptTarget = this.ship.pos.add(fuelPosition).mul(0.5);

        this.ai.setTarget({
            pos: interceptTarget,
            v: this.ship.v
        });
        this.ai.control();
    }
}

export default GameOfTag;
