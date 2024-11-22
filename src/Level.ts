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
import { Config } from "./config";
import { DefaultColor, HudItemDisabled } from "./Hud/HudItem";
import { UI } from "./UI/UI";

const DEFAULT_ZOOM = 3;

abstract class Level {
    static debugMode = false;

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

    abstract get name(): string;

    abstract get description(): string;

    init(ctx: CanvasRenderingContext2D, number: number) {
        this.ctx = ctx;
        this.number = number;

        this.graphics = this.getGraphics();
        this.physics = this.getPhysics();

        this.ship.mass = Config.ship.mass;
        this.physics.add(this.ship);
        this.graphics.add(this.ship);

        this.createObjects();
        this.createObjectives();

        this.initHud();

        this.initUI();

        const intro = new LevelIntro(this);
        this.graphics.add(intro);
        this.physics.add(intro);
    }

    private initUI() {
        const ui = new UI(this);
        this.graphics.add(ui);
    }

    private initHud() {
        const { texts } = this.hud;

        const debugColor = Level.debugMode ? DefaultColor : HudItemDisabled;
        texts.add(() => `PHYSICS  ${this.physics.count}`, debugColor);
        texts.add(() => `GRAPHICS ${this.graphics.count}`, debugColor);

        texts.add(() => {
            const screen = Pointer.getPosition();
            const world = this.camera.toWorldCoordinates(this.ctx, screen);
            return `MOUSE: ${screen} (SCREEN) ${world} (WORLD)`;
        }, debugColor);

        this.graphics.add(this.hud);
    }

    getGraphics = () => this.graphics;

    getPhysics = () => this.physics;

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
            this.updateInternal();
        }
    }

    private updateInternal() {
        if (!this.ship.alive) {
            this.failure("YOUR SHIP HAS BEEN DESTROYED.");
        }
        else if (this.ship.fuelTank.isEmpty()) {
            this.failure("YOU RAN OUT OF FUEL.");
        }
        else if (this.objectivesCleared()) {
            this.success();
        }
    }

    objectivesCleared(): boolean {
        if (this.objectives.length > 0) {
            const numCleared = this.getNumberOfClearedObjectives();

            if (numCleared == this.objectives.length) {
                return true;
            }
        }

        return false;
    }

    private getNumberOfClearedObjectives() {
        let numCleared = 0;
        for (const objective of this.objectives) {
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
        return numCleared;
    }

    get ended(): boolean {
        return this.passed || this.failureMessage != undefined;
    }

    success(): void {
        if (this.passed) {
            throw new Error("Already passed.");
        }
        this.passed = true;
        this.showOutro();
    }

    failure(message: string): void {
        if (this.failureMessage) {
            throw new Error("Already failed.");
        }
        this.failureMessage = message;
        this.showOutro();
    }

    private showOutro(): void {
        const outro = new LevelOutro(this);
        this.physics.add(outro);
        this.graphics.add(outro);
    }
}

export default Level;
