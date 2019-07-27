import ParticleEngine from "./ParticleEngine";
import Particle from "./Particle";
import { random } from "./Utils";
import Vector from "./Vector";

class ExplosionParticleEngine extends ParticleEngine {
    explode(particleCount: number, velocityMin: number, velocityMax: number, originVelocity: Vector = Vector.Zero): void {
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(
                new Particle(this.pos, 1 + Math.random(), Math.random() * Math.PI * 2, random(velocityMin, velocityMax), originVelocity)
            );
        }
    }   
}

export default ExplosionParticleEngine;