import PhysicsEngine from "../Physics/PhysicsEngine";
import { VacuumOfSpace } from "../Physics/Environment";
import { Graphics, initializeGraphics } from "../Graphics/Graphics";
import Camera from "../Graphics/Camera";
import Vector from "../Physics/Vector";
import type ShipController from "../ShipController";
import Ship from "../Ship";
import { LevelIntro } from "../LevelIntro";
import type Objective from "./Objective";
import type Fuel from "../Fuel";
import { Config } from "../config";
import { initHud, initUI } from "./utils";
import { getMissionStatus, LevelEndController } from "./mission";
import { Stats } from "./Stats";
import { Hud } from "../components/Hud";
import { Viewport } from "@/Graphics/Viewport";
import type { Beacon } from "@/Beacon";


function createViewport(): Viewport {
    const viewport = new Viewport(
        initializeGraphics("game"),
        new Camera(Vector.Zero, Config.camera.defaultZoom)
    );

    viewport.getCenter = () => new Vector(
        viewport.width / 2 + Config.ui.missionControl.windowWidth / 2,
        viewport.height / 2
    );

    return viewport;
}

abstract class Level extends EventTarget {
    public viewport = createViewport();

    public graphics: Graphics = new Graphics();
    public physics: PhysicsEngine = new PhysicsEngine(VacuumOfSpace);
    public ship: Ship = new Ship(Vector.Zero);
    public shipController?: ShipController;
    public failureMessage?: string;
    public objectives: Objective[] = [];
    public passed = false;
    public hud: Hud = new Hud(this);
    public number?: number;
    public stats = new Stats();

    private endController = new LevelEndController(this);

    public get ended(): boolean {
        return this.passed || this.failureMessage != undefined;
    }

    public abstract get name(): string;

    public abstract get description(): string;

    public init(viewport: Viewport, number: number) {
        this.viewport = viewport;
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

    public addBeacon(beacon: Beacon): void {
        this.physics.add(beacon);
        this.graphics.add(beacon);
    }

    public update(time: number, delta: number) {
        this.physics.update(time, delta);

        if (!this.ended) {
            this.stats.integrate(this.ship.stats);
            this.endController?.checkForCompletion();
        }
    }

    public objectivesCleared(): boolean {
        if (this.objectives.length == 0) return false;
        const status = getMissionStatus(this.objectives);
        if (status.failure) {
            this.failure(status.message || "MISSION FAILED.");
            return false;
        }
        return status.clearedObjectives == this.objectives.length;
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

    protected addOrderedObjectives(objectives: Objective[]) {
        const updateText = (i: number) => {
            if (typeof objectives[i].text == "string") {
                objectives[i].text = (i + 1) + ". " + objectives[i].text;
            }
        };

        for (let i = 0; i < objectives.length - 1; i++) {
            updateText(i);
            objectives[i + 1].addDependency(objectives[i]);
        }

        updateText(objectives.length - 1);

        this.objectives.push(...objectives);
    }

    public abstract createObjects(): void;

    public abstract createObjectives(): void;
}

export default Level;
