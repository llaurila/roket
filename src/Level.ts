import PhysicsEngine from "./Physics/PhysicsEngine";
import { VacuumOfSpace } from "./Physics/Environment";
import { Graphics, initializeGraphics } from "./Graphics/Graphics";
import Camera from "./Graphics/Camera";
import Vector from "./Physics/Vector";
import ShipController from "./ShipController";
import Ship from "./Ship";
import { LevelIntro } from "./LevelIntro";
import { LevelOutro } from "./LevelOutro";

abstract class Level {
    static debugMode: boolean = false;

    ctx: CanvasRenderingContext2D = initializeGraphics("game");
    graphics: Graphics = new Graphics();
    physics: PhysicsEngine = new PhysicsEngine(VacuumOfSpace);
    camera: Camera = new Camera(Vector.Zero, 3);
    ship: Ship = new Ship(Vector.Zero);
    shipController?: ShipController;
    failureMessage?: string;

    abstract get name(): string;

    abstract get description(): string;

    init(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.graphics = this.getGraphics();
        this.physics = this.getPhysics();

        this.ship.mass = 800;
        this.physics.add(this.ship);
        this.graphics.add(this.ship);

        this.createObjects();

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

    update(time: number, delta: number) {
        this.physics.update(time, delta);

        if (!this.ship.alive) {
            this.failure("Destroyed!");
        }
        else if (this.ship.fuelTank.isEmpty()) {
            this.failure("Out of fuel!");
        }
    }

    success(): void {

    }

    failure(message: string): void {
        this.failureMessage = message;
        this.graphics.add(new LevelOutro(this));
    }
}

export default Level;