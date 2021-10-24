import PhysicsEngine from "./Physics/PhysicsEngine";
import { VacuumOfSpace } from "./Physics/Environment";
import { Graphics, initializeGraphics } from "./Graphics/Graphics";
import Camera from "./Graphics/Camera";
import Vector from "./Physics/Vector";
import ShipController from "./ShipController";
import Ship from "./Ship";
import { LevelIntro } from "./LevelIntro";
import { LevelOutro } from "./LevelOutro";
import Objective from "./Objective";
import Pointer from "./Controls/Pointer";
import { Hud } from "./Hud";
import Fuel from "./Fuel";

abstract class Level {
    static debugMode: boolean = false;

    public ctx: CanvasRenderingContext2D = initializeGraphics("game");
    public graphics: Graphics = new Graphics();
    public physics: PhysicsEngine = new PhysicsEngine(VacuumOfSpace);
    public camera: Camera = new Camera(Vector.Zero, 3);
    public ship: Ship = new Ship(Vector.Zero);
    public shipController?: ShipController;
    public failureMessage?: string;
    public objectives: Objective[] = [];
    public passed: boolean = false;
    public hud: Hud = new Hud(this.ship, this.physics);
    public number?: number;

    abstract get name(): string;

    abstract get description(): string;

    init(ctx: CanvasRenderingContext2D, number: number) {
        this.ctx = ctx;
        this.number = number;

        this.graphics = this.getGraphics();
        this.physics = this.getPhysics();

        this.ship.mass = 800;
        this.physics.add(this.ship);
        this.graphics.add(this.ship);

        this.createObjects();
        this.createObjectives();

        this.hud = new Hud(this.ship, this.physics);

        this.hud.add(() => `Time: ${this.physics.time.toFixed()} s`);
        this.hud.add(() => `Velocity: ${this.ship.v.length().toFixed(1)} m/s`);
        this.hud.add(() => `Fuel: ${(this.ship.fuelTank.currentAmount / this.ship.fuelTank.capacity * 100).toFixed()}% (${this.ship.fuelTank.currentAmount.toFixed()} kg)`);

        for (let i = 0; i < this.objectives.length; i++) {
            this.hud.add(() => {
                const objective = this.objectives[i];
                if (objective.cleared) {
                    return `Objective ${i + 1} CLEARED (${objective.text})`;
                }
                return `Objective ${i + 1}: ${objective.text}`;
            });
        }

        this.hud.add(() => `Physics: ${this.physics.count}`, () => Level.debugMode);
        this.hud.add(() => `Graphics: ${this.graphics.count}`, () => Level.debugMode);

        this.hud.add(() => {
            const screen = Pointer.getPosition();
            const world = this.camera.toWorldCoordinates(this.ctx, screen);
            return `Mouse: ${screen} (screen) ${world} (world)`;
        }, () => Level.debugMode);

        this.graphics.add(this.hud);

        const intro = new LevelIntro(this);
        this.graphics.add(intro);
        this.physics.add(intro);
    }

    getGraphics(): Graphics {
        return new Graphics();
    }

    getPhysics(): PhysicsEngine {
        return new PhysicsEngine(VacuumOfSpace);
    }

    abstract createObjects(): void;

    abstract createObjectives(): void;

    addFuelCapsule(fuelCapsule: Fuel): void {
        this.physics.add(fuelCapsule);
        this.graphics.add(fuelCapsule);

        fuelCapsule.onCollision(e => {
            if (e.target == this.ship) {
                fuelCapsule.collect(this.ship);
            }
        });
    }

    update(time: number, delta: number) {
        this.physics.update(time, delta);

        if (!this.ended) {
            if (!this.ship.alive) {
                this.failure("Destroyed!");
            }
            else if (this.ship.fuelTank.isEmpty()) {
                this.failure("Out of fuel!");
            }
            else if (this.objectivesCleared()) {
                this.success();
            }
        }
    }

    objectivesCleared(): boolean {
        if (this.objectives.length > 0) {
            let numCleared = 0;
            for (let objective of this.objectives) {
                if (objective.cleared) {
                    numCleared++;
                }
                else {
                    if (objective.check()) {
                        objective.cleared = true;
                        numCleared++;
                    }
                }
            }

            if (numCleared == this.objectives.length) {
                return true;
            }    
        }

        return false;
    }

    get ended(): boolean {
        return this.passed || this.failureMessage != undefined;
    }

    success(): void {
        if (this.passed) {
            throw new Error('Already passed.')
        }
        this.passed = true;
        this.graphics.add(new LevelOutro(this));
    }

    failure(message: string): void {
        if (this.failureMessage) {
            throw new Error('Already failed.')
        }
        this.failureMessage = message;
        this.graphics.add(new LevelOutro(this));
    }
}

export default Level;