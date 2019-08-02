import ParticleEngine from "./ParticleEngine";
import Vector from "../Physics/Vector";
import { degToRad, random } from "../Utils";
import Particle from "./Particle";

class SprayParticleEngine extends ParticleEngine {
    velocity: () => number;
    getRate: () => number = () => 0;
    emitting: boolean = false;
    originVelocity: Vector = Vector.Zero;
    timeSinceLastEmitted: number = 0;
    
    constructor(position: Vector, velocity: () => number) {
        super(position);
        this.velocity = velocity;
    }

    start(getRate: () => number): void {
        this.getRate = getRate;
        this.timeSinceLastEmitted = 0;
        this.emitting = true;
    }

    stop(): void {
        this.emitting = false;
    }

    get shouldEmit(): boolean {
        return this.timeSinceLastEmitted > (1 / this.getRate());
    }

    emitOne(): void {
        this.particles.push(
            new Particle(this.pos, Math.random() / 2 + 0.25, degToRad(random(80, 100)) - this.rotation, this.velocity(), this.originVelocity)
        );
        this.timeSinceLastEmitted -= 1 / this.getRate();
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.emitting) {
            this.timeSinceLastEmitted += delta;
            while (this.shouldEmit) {
                this.emitOne();
            }
        }
    }
}

export default SprayParticleEngine;