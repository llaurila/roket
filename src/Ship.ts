import Body from "./Physics/Body";
import IDrawable from './Graphics/IDrawable';
import Polygon from "./Graphics/Polygon";
import Vector from "./Physics/Vector";
import Camera from "./Graphics/Camera";
import Engine from "./Engine";
import FuelTank from "./FuelTank";
import ExplosionParticleEngine from "./Graphics/ExplosionParticleEngine";
import Shapes from "./Graphics/Shapes";
import Ammo from "./Ammo";
import { Graphics } from "./Graphics/Graphics";
import CircleCollider from "./Physics/CircleCollider";

const SCALE = 2;

class Ship extends Body implements IDrawable {
    static Shape: Polygon = Shapes.Ship.mul(SCALE);

    engineLeft: Engine;
    engineRight: Engine;
    fuelTank: FuelTank;
    graphics?: Graphics;
    circleCollider = new CircleCollider(4);
    
    constructor(position: Vector) {
        super(position);
        this.fuelTank = new FuelTank(170);
        this.engineLeft = new Engine(this, new Vector(-0.5, -4), -0.2, 7000, this.fuelTank);
        this.engineRight = new Engine(this, new Vector(+0.5, -4), 0.2, 7000, this.fuelTank);
    }

    fire(): void {
        if (!this.alive) {
            throw new Error("Ship not alive, can't fire.");
        }

        let ammo = new Ammo(this.pos.add(this.getHeading().mul(5)));
        ammo.rotation = this.rotation;
        ammo.v = this.v;

        let F = this.getHeading().mul(10000);

        ammo.applyForce(F, ammo.centerOfMass);
        this.applyForce(F.neg(), this.centerOfMass);

        if (this.physics) {
            this.physics.add(ammo);
        }

        if (this.graphics) {
            this.graphics.add(ammo);
        }            
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.alive) {
            if (Math.abs(this.angularVelocity) > 20) {
                this.die();
            }

            updateEngines([this.engineLeft, this.engineRight], time, delta);
        }
    }

    die(): void {
        super._alive = false;

        if (this.physics && this.graphics) {
            const explosion = new ExplosionParticleEngine(this.pos, {
                particleCount: 300,
                velocityMin: 0,
                velocityMax: 25,
                originVelocity: this.v
            });

            this.physics.add(explosion);
            this.graphics.add(explosion);
        }
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
    }
}

function updateEngines(engines: Engine[], time: number, delta: number) {
    for (let engine of engines) {
        engine.update(time, delta);
        engine.applyForcesOnParent();    
    }
}

export default Ship;