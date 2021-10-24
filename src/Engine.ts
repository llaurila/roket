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

const DEFAULT_CONSUMPTION = 0.0001675;
const PARTICLE_VELOCITY_MIN = 20;
const PARTICLE_VELOCITY_MAX = 80;
const MAX_PARTICLE_RATE = 200;

class Engine implements IUpdatable, IDrawable {
    id: number;
    parent: Body;
    relativeProps: IRelativeProps;
    maxThrust: number;
    consumption: number = DEFAULT_CONSUMPTION;
    fuelTank: FuelTank;

    private throttle = 0;
    private output = 0;
    private particleEngine: ParticleEngine;

    constructor(
        parent: Body,
        relativeProps: IRelativeProps,
        maxThrust: number,
        fuelTank: FuelTank
    ) {
        this.id = UniqueIdProvider.next();
        this.parent = parent;
        this.relativeProps = relativeProps;
        this.maxThrust = maxThrust;
        this.fuelTank = fuelTank;
        this.particleEngine = new ParticleEngine(
            parent.pos.add(relativeProps.position),
            () => {
                const scale = PARTICLE_VELOCITY_MAX - PARTICLE_VELOCITY_MIN;
                return random(PARTICLE_VELOCITY_MIN, this.throttle * scale);
            });
    }

    // eslint-disable-next-line class-methods-use-this
    get alive() {
        return true;
    }

    get targetOutput(): number {
        return this.maxThrust * this.throttle;
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
        if (this.fuelTank.isEmpty()) {
            this.output = 0;
        }
        else {
            const MAX_CHANGE = 20000;
            let change = this.targetOutput - this.output;
            change = Math.min(change, delta * MAX_CHANGE);
            change = Math.max(change, delta * -MAX_CHANGE);
            this.output += change;
        }

        this.particleEngine.pos = this.worldPosition;
        this.particleEngine.originVelocity = this.parent.v;
        this.particleEngine.rotation = this.worldRotation;

        if (this.output > 0) {
            this.fuelTank.consume(this.consumption * this.output * delta);
        }

        if (this.output > 0) {
            if (!this.particleEngine.emitting) {
                this.particleEngine.start(() => this.throttle * MAX_PARTICLE_RATE);
            }
        }
        else {
            if (this.particleEngine.emitting) {
                this.particleEngine.stop();
            }
        }

        this.particleEngine.update(time, delta);
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        this.particleEngine.draw(ctx, camera);
    }
}

export default Engine;
