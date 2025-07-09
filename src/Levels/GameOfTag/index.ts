
import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import Ship from "@/Ship";
import { Config } from "@/config";
import { generateFuelCapsule } from "./fuel";
import NPCAI from "./NPCAI";
import Vector from "@/Physics/Vector";
import type Fuel from "@/Fuel";
import type { IColor } from "@/Graphics/Color";

class GameOfTag extends DataLevel {
    public enemy: Ship;
    public ai?: NPCAI;

    public started = false;
    public caught = false;

    private fuel?: Fuel;

    private readonly otherShipOffset: Vector;
    private readonly fuelCapsuleDistanceMin: number;
    private readonly fuelCapsuleDistanceMax: number;
    private readonly headingTolerance: number;
    private readonly maxDistanceFromPlayer: number;
    private readonly maxSpeed: number;

    public constructor() {
        super(data as LevelData);

        this.otherShipOffset = Vector.fromComponents(
            this.getEnv<number[]>("OTHER_SHIP_OFFSET")
        );

        this.fuelCapsuleDistanceMin = this.getEnv<number>("FUEL_CAPSULE_DISTANCE_MIN");
        this.fuelCapsuleDistanceMax = this.getEnv<number>("FUEL_CAPSULE_DISTANCE_MAX");
        this.headingTolerance = this.getEnv<number>("CORRECT_HEADING_TOLERANCE");
        this.maxDistanceFromPlayer = this.getEnv<number>("MAX_DISTANCE_FROM_PLAYER");
        this.maxSpeed = this.getEnv<number>("MAX_SPEED");

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

        this.ai = new NPCAI(
            this.enemy,
            {
                headingTolerance: this.headingTolerance,
                maxDistanceFromPlayer: this.maxDistanceFromPlayer,
                maxSpeed: this.maxSpeed
            },
            () => ({
                pos: this.ship.pos.add(this.fuel?.pos || Vector.Zero).mul(0.5),
                v: this.ship.v
            })
        );

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
            this.ai?.think();
        }
        else {
            this.startNpcWhenPlayerMoves();
        }
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
}

export default GameOfTag;
