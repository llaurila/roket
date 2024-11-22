import ParticleEngine from "./ParticleEngine";
import Particle from "./Particle";
import { random } from "../Utils";
import Vector from "../Physics/Vector";

const DEFAULT_TTL = 2;
const MAX_ANGULAR_VELOCITY = 10;

interface IExplosionSpec {
    particleCount: number,
    velocityMin: number,
    velocityMax: number,
    originVelocity: Vector
}

class ExplosionParticleEngine extends ParticleEngine {
    public ttl = DEFAULT_TTL;

    public constructor(pos: Vector, explosion: IExplosionSpec) {
        super(pos);
        this.explode(explosion);
    }

    public explode(explosion: IExplosionSpec): void {
        for (let i = 0; i < explosion.particleCount; i++) {
            this.particles.push(
                this.generateParticle(explosion)
            );
        }
    }

    private generateParticle(explosion: IExplosionSpec) {
        const ttl = 1 + Math.random();
        const angle = Math.random() * Math.PI * 2;

        const relativeVelocity = random(explosion.velocityMin, explosion.velocityMax);

        const velocity = new Vector(
            relativeVelocity * Math.cos(angle),
            -relativeVelocity * Math.sin(angle)
        ).add(explosion.originVelocity);

        return new Particle(
            this.pos,
            ttl,
            velocity,
            random(-MAX_ANGULAR_VELOCITY, MAX_ANGULAR_VELOCITY)
        );
    }

    public update(time: number, delta: number) {
        super.update(time, delta);
        this.ttl -= delta;
    }

    public get alive() {
        return this.ttl > 0;
    }
}

export default ExplosionParticleEngine;
