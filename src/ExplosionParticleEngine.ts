import ParticleEngine from "./ParticleEngine";
import Particle from "./Particle";
import { random } from "./Utils";
import Vector from "./Vector";

interface IExplosionSpec {
    particleCount: number,
    velocityMin: number,
    velocityMax: number,
    originVelocity: Vector
}

class ExplosionParticleEngine extends ParticleEngine {
    ttl: number = 2;

    constructor(pos: Vector, explosion: IExplosionSpec) {
        super(pos);
        this.explode(explosion);
    }

    explode(explosion: IExplosionSpec): void {
        for (let i = 0; i < explosion.particleCount; i++) {
            const ttl = 1 + Math.random();
            const angle = Math.random() * Math.PI * 2;

            this.particles.push(
                new Particle(this.pos, ttl, angle, random(explosion.velocityMin, explosion.velocityMax), explosion.originVelocity)
            );
        }
    }
    
    update(time: number, delta: number) {
        super.update(time, delta);
        this.ttl -= delta;
    }

    get alive() {
        return this.ttl > 0;
    }
}

export default ExplosionParticleEngine;