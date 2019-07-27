import IUpdatable from "./IUpdatable";
import Vector from "./Vector";
import IDrawable from "./IDrawable";
import Camera from "./Camera";
import ParticleEngine from "./SprayParticleEngine";
import FuelTank from "./FuelTank";
import Forces from "./Forces";
import Body from "./Ship";

const DEFAULT_CONSUMPTION = 0.0001675;

class Engine implements IUpdatable, IDrawable {
    parent: Body;
    relativePosition: Vector;
    relativeRotation: number;
    thrust: number;    
    consumption: number = DEFAULT_CONSUMPTION;
    fuelTank: FuelTank;

    private throttle: number = 0;
    private output: number = 0;
    private particleEngine: ParticleEngine;

    constructor(parent: Body, relativePosition: Vector, relativeRotation: number, thrust: number, fuelTank: FuelTank) {
        this.parent = parent;
        this.relativePosition = relativePosition;
        this.relativeRotation = relativeRotation;
        this.thrust = thrust;
        this.fuelTank = fuelTank;
        this.particleEngine = new ParticleEngine(
            parent.pos.add(relativePosition),
            () => this.output / 120 + Math.random() * this.output / 500);
    }

    get targetOutput(): number {
        return this.thrust * this.throttle;
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

    getForces(): Forces {
        let F = Vector.Zero;
        let Torque = 0;

        if (this.output > 0) {
            F = F.add(this.getHeading().mul(this.output));
            Torque += this.relativePosition.rotate(this.worldRotation).cross(F);
        }

        return new Forces(F, Torque);
    }

    get worldPosition(): Vector {
        return this.parent.pos.add(this.relativePosition.rotate(this.worldRotation));
    }

    get worldRotation(): number {
        return this.parent.rotation + this.relativeRotation;
    }

    getHeading(): Vector {
        return this.parent.getHeading().rotate(this.relativeRotation);
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
                this.particleEngine.start(() => this.output / 30);
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