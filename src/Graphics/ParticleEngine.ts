import type IDrawable from "./IDrawable";
import type IUpdatable from "../Physics/IUpdatable";
import type Vector from "../Physics/Vector";
import type Camera from "./Camera";
import type Particle from "./Particle";
import UniqueIdProvider from "../UniqueIdProvider";
import type PhysicsEngine from "../Physics/PhysicsEngine";
import type { Graphics } from "./Graphics";

class ParticleEngine implements IDrawable, IUpdatable {
    public id: number;
    public pos: Vector;
    public particles: Particle[] = [];
    public rotation = 0;
    public physics?: PhysicsEngine;
    public graphics?: Graphics;

    private readonly _alive = true;

    public constructor(position: Vector) {
        this.id = UniqueIdProvider.next();
        this.pos = position;

        setInterval(() => {
            this.particles = this.particles.filter(p => p.alive);
        }, 1000);
    }

    public get alive() {
        return this._alive;
    }

    public update(time: number, delta: number) {
        for (const particle of this.particles) {
            particle.update(time, delta);
        }
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        for (const particle of this.particles) {
            if (particle.alive) {
                particle.draw(ctx, camera);
            }
        }
    }
}

export default ParticleEngine;
