import ParticleEngine from "./ParticleEngine";
import Vector from "../Physics/Vector";
import { degToRad, random } from "../Utils";
import Particle from "./Particle";

const MIN_TTL = 0.25;
const MAX_TTL = 0.75;

const MIN_ANGLE_DEG = 80;
const MAX_ANGLE_DEG = 100;

const MAX_ANGULAR_VELOCITY = 10;

const ZeroRate = () => 0;

class SprayParticleEngine extends ParticleEngine {
    velocity: () => number;
    getRate: () => number = ZeroRate;
    emitting = false;
    originVelocity: Vector = Vector.Zero;
    timeSinceLastEmitted = 0;

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
        const angle = degToRad(random(MIN_ANGLE_DEG, MAX_ANGLE_DEG)) - this.rotation;
        const relativeVelocity = this.velocity();

        const velocity = new Vector(
            relativeVelocity * Math.cos(angle),
            -relativeVelocity * Math.sin(angle)
        ).add(this.originVelocity);

        this.particles.push(
            new Particle(
                this.pos,
                random(MIN_TTL, MAX_TTL),
                velocity,
                random(-MAX_ANGULAR_VELOCITY, MAX_ANGULAR_VELOCITY)
            )
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
