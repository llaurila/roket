import Body from "./Body";
import IDrawable from './IDrawable';
import Polygon from "./Polygon";
import Vector from "./Vector";
import Camera from "./Camera";
import Engine from "./Engine";
import FuelTank from "./FuelTank";
import Forces from "./Forces";
import ExplosionParticleEngine from "./ExplosionParticleEngine";

const SCALE = 2;

class Ship extends Body implements IDrawable {
    static Shape: Polygon = new Polygon([
        new Vector( 0,  2),
        new Vector(+1, -1),
        new Vector(-1, -1)
    ]).mul(SCALE);

    engineLeft: Engine;
    engineRight: Engine;
    fuelTank: FuelTank;
    explosion: ExplosionParticleEngine;
    alive: boolean = true;

    constructor(position: Vector) {
        super(position);
        this.fuelTank = new FuelTank(170);
        this.engineLeft = new Engine(this, new Vector(-0.5, -4), -0.2, 7000, this.fuelTank);
        this.engineRight = new Engine(this, new Vector(+0.5, -4), 0.2, 7000, this.fuelTank);
        this.explosion = new ExplosionParticleEngine(position);
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.alive) {
            this.engineLeft.update(time, delta);
            this.engineRight.update(time, delta);

            if (Math.abs(this.angularVelocity) > 20) {
                this.die();
            }
        }
        else {
            this.explosion.update(time, delta);
        }
    }

    die(): void {
        this.alive = false;
        this.explosion.pos = this.pos;
        this.explosion.explode(300, 0, 25, this.v);
    }

    getMass(): number {
        return super.getMass() + this.fuelTank.getMass();
    }

    getForces(): Forces {
        let forces = this.engineLeft.getForces();
        forces = forces.add(this.engineRight.getForces());
        return super.getForces().add(forces);
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        if (this.alive) {
            const drawContext = {
                pos: this.pos,
                rotation: this.rotation,
                ctx,
                camera
            };
    
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#a0a0a0";
    
            Ship.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);
    
            ctx.stroke();
            ctx.restore();
    
            this.engineLeft.draw(ctx, camera);
            this.engineRight.draw(ctx, camera);
        }
        else {
            this.explosion.draw(ctx, camera);
        }
    }
}

export default Ship;