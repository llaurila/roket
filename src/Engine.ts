import IUpdatable from "./Physics/IUpdatable";
import Vector from "./Physics/Vector";
import Camera from "./Graphics/Camera";
import ParticleEngine from "./Graphics/SprayParticleEngine";
import FuelTank from "./FuelTank";
import Body from "./Ship";
import UniqueIdProvider from "./UniqueIdProvider";
import IDrawable from "./Graphics/IDrawable";
import { random } from "./Utils";
import { IRelativeProps } from "./types";
import { IEngineConfig } from "./config.types";

class Engine implements IUpdatable, IDrawable {
    id: number;
    parent: Body;
    relativeProps: IRelativeProps;
    fuelTank: FuelTank;

    private readonly _alive = true;
    private readonly config: IEngineConfig;

    private throttle = 0;
    private output = 0;
    private particleEngine: ParticleEngine;

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

        this.particleEngine = new ParticleEngine(
            parent.pos.add(relativeProps.position),
            () => {
                const scale = config.particleVelocityMax -
                config.particleVelocityMin;

                return random(
                    config.particleVelocityMin,
                    this.throttle * scale
                );
            });

        this.config = config;
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
        this.setThrottle(value ? 1 : 0);
    }

    setThrottle(value: number) {
        this.throttle = value;
    }

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

    getHeading(): Vector {
        return this.parent.getHeading().rotate(this.relativeProps.rotation);
    }

    update(time: number, delta: number) {
        this.updateOutput(delta);

        this.particleEngine.pos = this.worldPosition;
        this.particleEngine.originVelocity = this.parent.v;
        this.particleEngine.rotation = this.worldRotation;

        if (this.output > 0) {
            this.fuelTank.consume(this.config.consumption * this.output * delta);
            this.startParticleEngine();
        }
        else {
            this.stopParticleEngine();
        }

        this.particleEngine.update(time, delta);
    }

    private startParticleEngine() {
        if (!this.particleEngine.emitting) {
            this.particleEngine.start(
                () => this.relativeOutput * this.config.particleRateMax);
        }
    }

    private stopParticleEngine() {
        if (this.particleEngine.emitting) {
            this.particleEngine.stop();
        }
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

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        this.particleEngine.draw(ctx, camera);
    }
}

export default Engine;
