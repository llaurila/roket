import Body from "./Body";
import IDrawable from './IDrawable';
import Polygon from "./Polygon";
import Vector from "./Vector";
import Camera from "./Camera";
import Engine from "./Engine";
import FuelTank from "./FuelTank";
import Forces from "./Forces";
import ExplosionParticleEngine from "./ExplosionParticleEngine";
import Shapes from "./Shapes";
import Ammo from "./Ammo";

const SCALE = 2;

class Ship extends Body implements IDrawable {
    static Shape: Polygon = Shapes.Ship.mul(SCALE);

    engineLeft: Engine;
    engineRight: Engine;
    fuelTank: FuelTank;
    explosion: ExplosionParticleEngine;

    constructor(position: Vector) {
        super(position);
        this.fuelTank = new FuelTank(170);
        this.engineLeft = new Engine(this, new Vector(-0.5, -4), -0.2, 7000, this.fuelTank);
        this.engineRight = new Engine(this, new Vector(+0.5, -4), 0.2, 7000, this.fuelTank);
        this.explosion = new ExplosionParticleEngine(position);
    }

    fire(): Ammo {
        let ammo = new Ammo(this.pos.add(this.getHeading().mul(5)));
        ammo.rotation = this.rotation;
        ammo.v = this.v;

        let F = this.getHeading().mul(10000);

        ammo.applyForce(F, ammo.centerOfMass);
        this.applyForce(F.neg(), this.centerOfMass);

        return ammo;
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.alive) {
            if (Math.abs(this.angularVelocity) > 20) {
                this.die();
            }

            updateEngines([this.engineLeft, this.engineRight], time, delta);
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

function updateEngines(engines: Engine[], time: number, delta: number) {
    for (let engine of engines) {
        engine.update(time, delta);
        engine.applyForcesOnParent();    
    }
}

export default Ship;