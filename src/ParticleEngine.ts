import IDrawable from "./IDrawable";
import IUpdatable from "./IUpdatable";
import Vector from "./Vector";
import Camera from "./Camera";
import Particle from "./Particle";

class ParticleEngine implements IDrawable, IUpdatable {    
    pos: Vector;
    particles: Particle[] = [];
    
    timeSinceLastEmitted: number = 0;
    rotation: number = 0;

    constructor(position: Vector) {
        this.pos = position;

        setInterval(() => {
            this.particles = this.particles.filter(p => p.alive);
        }, 1000)
    }
    
    update(time: number, delta: number) {
        for (let particle of this.particles) {
            particle.update(time, delta);
        }
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        for (let particle of this.particles) {
            if (particle.alive) {
                particle.draw(ctx, camera);
            }
        }
    }
}

export default ParticleEngine;