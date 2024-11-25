import Body from "../Physics/Body";
import type IDrawable from "../Graphics/IDrawable";
import type Polygon from "../Graphics/Polygon";
import type Vector from "../Physics/Vector";
import type Camera from "../Graphics/Camera";
import type Engine from "../Engine";
import FuelTank from "../FuelTank";
import ExplosionParticleEngine from "../Graphics/ExplosionParticleEngine";
import Shapes from "../Graphics/Shapes";
import Ammo from "../Ammo";
import type { Graphics } from "../Graphics/Graphics";
import CircleCollider from "../Physics/CircleCollider";
import { Config } from "../config";
import { getColorString } from "../Graphics/Color";
import { initLeftEngine, initRightEngine, updateEngines } from "./utils";
import ShipConfig from "./config";
import { Stats } from "../Level/Stats";

const { ship } = Config;

class Ship extends Body implements IDrawable {
    public static Shape: Polygon = Shapes.Ship.mul(ship.length / ShipConfig.SHAPE_LENGTH);

    public engineLeft: Engine;
    public engineRight: Engine;
    public fuelTank: FuelTank;
    public hullIntegrity = 1;
    public graphics?: Graphics;
    public circleCollider = new CircleCollider(ship.length / 2 * ship.colliderRelativeSize);
    public color = ship.color;

    public stats: Stats = new Stats();

    public constructor(position: Vector) {
        super(position);
        this.fuelTank = new FuelTank(ship.fuelTankCapacity);
        this.engineLeft = initLeftEngine(this);
        this.engineRight = initRightEngine(this);
    }

    public fire(): void {
        if (!this.alive) throw new Error("Ship not alive, can't fire.");
        this.fireInternal();
    }

    public update(time: number, delta: number) {
        super.update(time, delta);

        if (this.alive) {
            const excessSpin = Math.abs(this.angularVelocity) - ship.maxSafeAngularVelocity;
            if (excessSpin > 0) {
                const DAMAGE_SEVERITY = 0.1;
                this.inflictHullDamage(excessSpin * DAMAGE_SEVERITY * delta);
            }

            updateEngines([this.engineLeft, this.engineRight], time, delta);

            this.updateStats(delta);
        }
    }

    public inflictHullDamage(damage: number): void {
        this.hullIntegrity = Math.max(0, this.hullIntegrity - damage);
        if (this.hullIntegrity === 0) this.die();
    }

    public die(): void {
        this._alive = false;
        this.hullIntegrity = 0;

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

    public getMass(): number {
        return super.getMass() + this.fuelTank.getMass();
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
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

    private updateStats(delta: number) {
        this.stats = new Stats();

        const { stats, engineLeft, engineRight, angularVelocity } = this;
        const v = this.v.length();

        stats.angularVelocity = Math.abs(angularVelocity);
        stats.distance = v * delta;
        stats.distanceFromBeacon = this.pos.length();

        stats.integrate(engineLeft.stats);
        engineLeft.stats = new Stats();

        stats.integrate(engineRight.stats);
        engineRight.stats = new Stats();

        stats.velocity = v;
    }

    private fireInternal(): void {
        const ammo = new Ammo(
            this.pos.add(this.getHeading().mul(ShipConfig.AMMO_START_POS))
        );

        ammo.rotation = this.rotation;
        ammo.v = this.v;

        const F = this.getHeading().mul(ShipConfig.AMMO_FORCE);

        ammo.applyForce(F, ammo.centerOfMass);
        this.applyForce(F.neg(), this.centerOfMass);

        this.physics?.add(ammo);
        this.graphics?.add(ammo);
    }
}

export default Ship;
