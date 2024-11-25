import PhysicsEngine from "../Physics/PhysicsEngine";
import { VacuumOfSpace } from "../Physics/Environment";
import { Graphics, initializeGraphics } from "../Graphics/Graphics";
import Camera from "../Graphics/Camera";
import Vector from "../Physics/Vector";
import type ShipController from "../ShipController";
import Ship from "../Ship";
import { LevelIntro } from "../LevelIntro";
import type Objective from "../Objective";
import { Hud } from "../Hud";
import type Fuel from "../Fuel";
import { Config } from "../config";
import { getNumberOfClearedObjectives, initHud, initUI, LevelEndController } from "./utils";

const DEFAULT_ZOOM = 3;

abstract class Level {
    public ctx: CanvasRenderingContext2D = initializeGraphics("game");
    public graphics: Graphics = new Graphics();
    public physics: PhysicsEngine = new PhysicsEngine(VacuumOfSpace);
    public camera: Camera = new Camera(Vector.Zero, DEFAULT_ZOOM);
    public ship: Ship = new Ship(Vector.Zero);
    public shipController?: ShipController;
    public failureMessage?: string;
    public objectives: Objective[] = [];
    public passed = false;
    public hud: Hud = new Hud(this);
    public number?: number;

    private endController = new LevelEndController(this);

    public get ended(): boolean {
        return this.passed || this.failureMessage != undefined;
    }

    public abstract get name(): string;

    public abstract get description(): string;

    public init(ctx: CanvasRenderingContext2D, number: number) {
        this.ctx = ctx;
        this.number = number;

        this.graphics = this.getGraphics();
        this.physics = this.getPhysics();

        this.ship.mass = Config.ship.mass;
        this.physics.add(this.ship);
        this.graphics.add(this.ship);

        this.createObjects();
        this.createObjectives();

        initHud(this);
        initUI(this);

        const intro = new LevelIntro(this);
        this.graphics.add(intro);
        this.physics.add(intro);
    }

    public getGraphics = () => this.graphics;

    public getPhysics = () => this.physics;

    public addFuelCapsule(fuelCapsule: Fuel): void {
        this.physics.add(fuelCapsule);
        this.graphics.add(fuelCapsule);

        fuelCapsule.onCollision(e => {
            if (e.target == this.ship) {
                fuelCapsule.collect(this.ship);
            }
        });
    }

    public update(time: number, delta: number) {
        this.physics.update(time, delta);
        if (!this.ended) this.endController?.checkForCompletion();
    }

    public objectivesCleared(): boolean {
        if (this.objectives.length == 0) return false;
        const numCleared = getNumberOfClearedObjectives(this.objectives);
        return numCleared == this.objectives.length;
    }

    public success(): void {
        if (this.passed) throw new Error("Already passed.");
        this.passed = true;
        this.endController.showOutro();
    }

    public failure(message: string): void {
        if (this.failureMessage) throw new Error("Already failed.");
        this.failureMessage = message;
        this.endController.showOutro();
    }

    public abstract createObjects(): void;

    public abstract createObjectives(): void;
}

export default Level;
