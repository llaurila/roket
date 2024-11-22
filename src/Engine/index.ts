import Body from "../Physics/Body";
import IUpdatable from "../Physics/IUpdatable";
import Vector from "../Physics/Vector";
import Camera from "../Graphics/Camera";
import FuelTank from "../FuelTank";
import UniqueIdProvider from "../UniqueIdProvider";
import IDrawable from "../Graphics/IDrawable";
import { IRelativeProps } from "../types";
import { IEngineConfig } from "../config.types";
import ParticleEngineController from "./ParticleEngineController";

class Engine implements IUpdatable, IDrawable {
    id: number;
    parent: Body;
    relativeProps: IRelativeProps;
    fuelTank: FuelTank;

    private readonly _alive = true;
    private readonly config: IEngineConfig;

    private throttle = 0;
    private output = 0;
    private particleEngineController: ParticleEngineController;

    constructor(
        parent: Body,
        relativeProps: IRelativeProps,
        fuelTank: FuelTank,
        config: IEngineConfig
    ) {
        this.id = UniqueIdProvider.next();
        this.parent = parent;
        this.relativeProps = relativeProps;
        this.fuelTank = fuelTank;
        this.config = config;
        
        this.particleEngineController =
            new ParticleEngineController(this, relativeProps.position, config);
    }

    get alive() {
        return this._alive;
    }

    get targetOutput(): number {
        return this.config.maxThrust * this.throttle;
    }

    get relativeOutput(): number {
        return this.output / this.config.maxThrust;
    }

    get burning() {
        if (this.fuelTank.isEmpty()) {
            return false;
        }
        return this.throttle > 0;
    }

    set burning(value: boolean) {
        this.throttle = value ? 1 : 0;
    }

    setThrottle(value: number) {
        if (value < 0 || value > 1) {
            throw new Error("Throttle must be between 0 and 1");
        }
        this.throttle = value;
    }

    getThrottle = () => this.throttle;

    applyForcesOnParent(): void {
        this.parent.applyForce(
            this.getHeading().mul(this.output),
            this.relativeProps.position.rotate(this.worldRotation)
        );
    }

    get worldPosition(): Vector {
        return this.parent.pos.add(this.relativeProps.position.rotate(this.worldRotation));
    }

    get worldRotation(): number {
        return this.parent.rotation + this.relativeProps.rotation;
    }

    getHeading = () => this.parent.getHeading().rotate(this.relativeProps.rotation);

    update(time: number, delta: number) {
        this.updateOutput(delta);

        const engineOn = this.output > 0;
        this.particleEngineController.on = engineOn;

        if (engineOn) {
            this.fuelTank.consume(this.config.consumption * this.output * delta);
        }

        this.particleEngineController.update(time, delta);
    }

    private updateOutput(delta: number) {
        if (this.fuelTank.isEmpty()) {
            this.output = 0;
        }
        else {
            const { maxOutputChangeRate } = this.config;

            const targetChange = this.targetOutput - this.output;

            const change = Math.max(
                Math.min(targetChange, maxOutputChangeRate * delta),
                -maxOutputChangeRate  * delta
            );

            this.output += change;
        }
    }

    draw = (ctx: CanvasRenderingContext2D, camera: Camera) =>
        this.particleEngineController.draw(ctx, camera);
}

export default Engine;
