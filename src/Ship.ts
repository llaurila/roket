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
import { Config } from "./config";
import { degToRad } from "./Utils";
import { getColorString } from "./Graphics/Color";

const SHAPE_LENGTH = 3;
const AMMO_START_POS = 5;
const AMMO_FORCE = 10000;

const { ship } = Config;

class Ship extends Body implements IDrawable {
    public static Shape: Polygon = Shapes.Ship.mul(ship.length / SHAPE_LENGTH);

    public engineLeft: Engine;
    public engineRight: Engine;
    public fuelTank: FuelTank;
    public graphics?: Graphics;
    public circleCollider = new CircleCollider(ship.length / 2 * ship.colliderRelativeSize);
    public color = ship.color;

    constructor(position: Vector) {
        super(position);
        this.fuelTank = new FuelTank(ship.fuelTankCapacity);

        this.engineLeft = new Engine(
            this,
            {
                position: ship.engineLeft.position,
                rotation: degToRad(ship.engineLeft.angle)
            },
            this.fuelTank,
            ship.engineLeft
        );

        this.engineRight = new Engine(
            this,
            {
                position: ship.engineRight.position,
                rotation: degToRad(ship.engineRight.angle)
            },
            this.fuelTank,
            ship.engineLeft
        );
    }

    fire(): void {
        if (!this.alive) {
            throw new Error("Ship not alive, can't fire.");
        }
        
        this.fireInternal();
    }

    private fireInternal(): void {
        const ammo = new Ammo(
            this.pos.add(this.getHeading().mul(AMMO_START_POS))
        );
        
        ammo.rotation = this.rotation;
        ammo.v = this.v;

        const F = this.getHeading().mul(AMMO_FORCE);

        ammo.applyForce(F, ammo.centerOfMass);
        this.applyForce(F.neg(), this.centerOfMass);

        this.addPhysicsAmmo(ammo);
        this.addGraphicsAmmo(ammo);
    }

    private addPhysicsAmmo(ammo: Ammo) {
        if (this.physics) {
            this.physics.add(ammo);
        }
    }

    private addGraphicsAmmo(ammo: Ammo) {
        if (this.graphics) {
            this.graphics.add(ammo);
        }
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.alive) {
            if (Math.abs(this.angularVelocity) > ship.maxSafeAngularVelocity) {
                this.die();
            }

            updateEngines([this.engineLeft, this.engineRight], time, delta);
        }
    }

    die(): void {
        this._alive = false;

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
            ctx.strokeStyle = getColorString(this.color);

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
