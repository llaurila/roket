import type Body from "../Physics/Body";
import type IUpdatable from "../Physics/IUpdatable";
import type Vector from "../Physics/Vector";
import type Camera from "../Graphics/Camera";
import type FuelTank from "../FuelTank";
import UniqueIdProvider from "../UniqueIdProvider";
import type IDrawable from "../Graphics/IDrawable";
import type { IRelativeProps } from "../types";
import type { IEngineConfig } from "../config.types";
import ParticleEngineController from "./ParticleEngineController";
import { calculateEngineOutputChange } from "./utils";

class Engine implements IUpdatable, IDrawable {
    public id: number;

    public choke = 1.0;
    public output = 0;

    private readonly _alive = true;

    private throttle = 0;
    private particleEngineController: ParticleEngineController;

    public constructor(
        public parent: Body,
        public relativeProps: IRelativeProps,
        public fuelTank: FuelTank,
        public readonly config: IEngineConfig,
        private maxThrust: number = config.maxThrust
    ) {
        this.id = UniqueIdProvider.next();

        this.particleEngineController =
            new ParticleEngineController(this, relativeProps.position, config);
    }

    public get alive() {
        return this._alive;
    }

    public get targetOutput(): number {
        return this.maxThrust * this.choke * this.throttle;
    }

    public get relativeOutput(): number {
        return this.output / this.maxThrust;
    }

    public get worldPosition(): Vector {
        return this.parent.pos.add(this.relativeProps.position.rotate(this.worldRotation));
    }

    public get worldRotation(): number {
        return this.parent.rotation + this.relativeProps.rotation;
    }

    public get burning() {
        if (this.fuelTank.isEmpty()) {
            return false;
        }
        return this.throttle > 0;
    }

    public set burning(value: boolean) {
        this.throttle = value ? 1 : 0;
    }

    public setThrottle(value: number) {
        if (value < 0 || value > 1) {
            throw new Error("Throttle must be between 0 and 1");
        }
        this.throttle = value;
    }

    public getThrottle = () => this.throttle;

    public setChoke(value: number) {
        if (value < 0 || value > 1) {
            throw new Error("Choke must be between 0 and 1");
        }
        this.choke = value;
    }

    public applyForcesOnParent(): void {
        this.parent.applyForce(
            this.getHeading().mul(this.output),
            this.relativeProps.position.rotate(this.worldRotation)
        );
    }

    public getHeading = () => this.parent.getHeading().rotate(this.relativeProps.rotation);

    public update(time: number, delta: number) {
        this.updateOutput(delta);

        const engineOn = this.output > 0;
        this.particleEngineController.on = engineOn;

        if (engineOn) {
            this.fuelTank.consume(this.config.consumption * this.output * delta);
        }

        this.particleEngineController.update(time, delta);
    }

    public draw = (ctx: CanvasRenderingContext2D, camera: Camera) => {
        this.particleEngineController.draw(ctx, camera);
    };

    private updateOutput(delta: number) {
        if (this.fuelTank.isEmpty()) {
            this.output = 0;
        }
        else {
            this.output += calculateEngineOutputChange(this, delta);
        }
    }
}

export default Engine;
