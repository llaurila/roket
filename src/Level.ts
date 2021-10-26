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

const DEFAULT_ZOOM = 3;

const defaultColor = DefaultColor;

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
    public hud: Hud = new Hud(this.ship, this.physics);
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

        const intro = new LevelIntro(this);
        this.graphics.add(intro);
        this.physics.add(intro);
    }

    private initHud() {
        this.hud = new Hud(this.ship, this.physics);

        const { texts } = this.hud;

        const NUM_LENGTH = 5;
        const getNum = (n: number, f = 0) => n.toFixed(f).padStart(NUM_LENGTH);

        texts.add(() => `MISSION TIME ${getNum(this.physics.time)} s`);
        texts.add(() => `VELOCITY     ${getNum(this.ship.v.length(), 1)} m/s`);

        texts.add(() => {
            const { currentAmount, capacity } = this.ship.fuelTank;
            const fuelPercent = currentAmount / capacity * 100;
            return `FUEL        ${getNum(fuelPercent)}% (${currentAmount.toFixed()} KG)`;
        });

        texts.add(() => "");

        for (let i = 0; i < this.objectives.length; i++) {
            texts.add(() => {
                const objective = this.objectives[i];
                return `OBJECTIVE ${i + 1}: ${objective.text}`;
            }, () => {
                const objective = this.objectives[i];
                return objective.cleared ? Config.typography.emphasisColor : defaultColor();
            });
        }

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

    getGraphics(): Graphics {
        return this.graphics;
    }

    getPhysics(): PhysicsEngine {
        return this.physics;
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
                this.failure("Your ship has been destroyed.");
            }
            else if (this.ship.fuelTank.isEmpty()) {
                this.failure("You ran out of fuel.");
            }
            else if (this.objectivesCleared()) {
                this.success();
            }
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
