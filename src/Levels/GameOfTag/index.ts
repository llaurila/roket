
import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import Ship from "@/Ship";
import { Config } from "@/config";
import { generateFuelCapsule } from "./fuel";
import NPCAI from "./NPCAI";
import Vector from "@/Physics/Vector";

class GameOfTag extends DataLevel {
    public enemy: Ship;
    public ai?: NPCAI;

    public started = false;
    public caught = false;

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
    }

    public createObjects(): void {
        super.createObjects();

        this.physics.add(this.enemy);
        this.graphics.add(this.enemy);

        this.enemy.color = { R: 1, G: 0, B: 1, A: 1 };

        this.enemy.mass = Config.ship.mass;
        this.enemy.rotation = 2;

        this.enemy.onCollision(e => {
            if (!this.caught && e.target == this.ship) {
                this.caught = true;
                this.enemy.die();
            }
        });

        this.ai = new NPCAI(this.ship, this.enemy, {
            headingTolerance: this.headingTolerance,
            maxDistanceFromPlayer: this.maxDistanceFromPlayer,
            maxSpeed: this.maxSpeed
        });

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
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest("caught", () => this.caught);
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

    private startNpcWhenPlayerMoves() {
        const INITIAL_SPEED = 10;

        if (this.ship.v.length() > 0) {
            this.enemy.v = this.enemy.getHeading().mul(INITIAL_SPEED);
            this.started = true;
        }
    }
}

export default GameOfTag;
