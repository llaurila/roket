import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import Ship from "@/Ship";
import Vector from "@/Physics/Vector";
import NPCAI from "../NPCAI";
import Fuel from "@/Fuel";
import { Config } from "@/config";
import type { IColor } from "@/Graphics/Color";

class FuelRush extends DataLevel {
    public enemy: Ship;
    public ai?: NPCAI;
    public fuelCapsules: Fuel[] = [];

    private playerScore = 0;
    private enemyScore = 0;

    private readonly fuelCapsuleCount: number;
    private readonly otherShipOffset: Vector;
    private readonly fuelCapsuleDistanceMin: number;
    private readonly fuelCapsuleDistanceMax: number;
    private readonly headingTolerance: number;
    private readonly maxDistanceFromPlayer: number;
    private readonly maxSpeed: number;

    public constructor() {
        super(data as LevelData);
        
        this.fuelCapsuleCount = this.getEnv<number>("FUEL_CAPSULE_COUNT");
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
            if (e.target == this.ship) {
                this.ship.die();
            }
        });

        this.generateFuelCapsules(this.fuelCapsuleCount);

        this.ai = new NPCAI(
            this.enemy,
            {
                headingTolerance: this.headingTolerance,
                maxDistanceFromPlayer: this.maxDistanceFromPlayer,
                maxSpeed: this.maxSpeed
            },
            () => {
                const target = this.getNearestFuel();
                return {
                    pos: target ? target.pos : this.ship.pos,
                    v: Vector.Zero
                };
            }
        );
    }

    public update(time: number, delta: number) {
        super.update(time, delta);
        this.ai?.think();
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
        const allCollected = () => this.fuelCapsules.every(f => !f.alive);

        this.registerObjectiveTest(
            "playerWon",
            () => allCollected() && this.playerScore > this.enemyScore
        );

        this.registerObjectiveTest(
            "playerLost",
            () => allCollected() && this.playerScore <= this.enemyScore
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

    private getNearestFuel(): Fuel | undefined {
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
}

export default FuelRush;
