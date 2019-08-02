import IDrawable from "./IDrawable";
import IUpdatable from "../Physics/IUpdatable";
import Vector from "../Physics/Vector";
import Camera from "./Camera";
import Particle from "./Particle";
import UniqueIdProvider from "../UniqueIdProvider";
import PhysicsEngine from "../Physics/PhysicsEngine";
import { Graphics } from "./Graphics";

class ParticleEngine implements IDrawable, IUpdatable { 
    id: number;   
    pos: Vector;
    particles: Particle[] = [];
        
    rotation: number = 0;
    physics?: PhysicsEngine;
    graphics?: Graphics;

    constructor(position: Vector) {
        this.id = UniqueIdProvider.next();
        this.pos = position;

        setInterval(() => {
            this.particles = this.particles.filter(p => p.alive);
        }, 1000)
    }

    get alive() {
        return true;
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