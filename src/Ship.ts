import Body from "./Physics/Body";
import IDrawable from "./Graphics/IDrawable";
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
const COLLIDER_RADIUS = 4;
const INITIAL_FUEL_TANK_CAPACITY = 170;
const ENGINE_MAX_THRUST = 7000;
const ENGINE_ANGLE = 0.2;
const ENGINE_POSITION_Y = -4;
const AMMO_START_POS = 5;
const AMMO_FORCE = 10000;
const MAX_SAFE_ANGULAR_VELOCITY = 20;

class Ship extends Body implements IDrawable {
    public static Shape: Polygon = Shapes.Ship.mul(SCALE);

    public engineLeft: Engine;
    public engineRight: Engine;
    public fuelTank: FuelTank;
    public graphics?: Graphics;
    public circleCollider = new CircleCollider(COLLIDER_RADIUS);
    public color = "#a0a0a0";

    constructor(position: Vector) {
        super(position);
        this.fuelTank = new FuelTank(INITIAL_FUEL_TANK_CAPACITY);

        this.engineLeft = new Engine(
            this,
            {
                position: new Vector(-0.5, ENGINE_POSITION_Y),
                rotation: -ENGINE_ANGLE
            },
            ENGINE_MAX_THRUST,
            this.fuelTank
        );

        this.engineRight = new Engine(
            this,
            {
                position: new Vector(+0.5, ENGINE_POSITION_Y),
                rotation: ENGINE_ANGLE
            },
            ENGINE_MAX_THRUST,
            this.fuelTank
        );
    }

    fire(): void {
        if (!this.alive) {
            throw new Error("Ship not alive, can't fire.");
        }

        const ammo = new Ammo(
            this.pos.add(this.getHeading().mul(AMMO_START_POS))
        );
        ammo.rotation = this.rotation;
        ammo.v = this.v;

        const F = this.getHeading().mul(AMMO_FORCE);

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
            if (Math.abs(this.angularVelocity) > MAX_SAFE_ANGULAR_VELOCITY) {
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
            ctx.strokeStyle = this.color;

            Ship.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

            ctx.stroke();
            ctx.restore();

            this.engineLeft.draw(ctx, camera);
            this.engineRight.draw(ctx, camera);
        }
    }
}

function updateEngines(engines: Engine[], time: number, delta: number) {
    for (const engine of engines) {
        engine.update(time, delta);
        engine.applyForcesOnParent();
    }
}

export default Ship;
