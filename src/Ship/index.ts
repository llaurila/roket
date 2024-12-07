import Body from "../Physics/Body";
import type IDrawable from "../Graphics/IDrawable";
import type Polygon from "../Graphics/Polygon";
import type Vector from "../Physics/Vector";
import type Engine from "../Engine";
import FuelTank from "../FuelTank";
import ExplosionParticleEngine from "../Graphics/ExplosionParticleEngine";
import Shapes from "../Graphics/Shapes";
import type { Graphics } from "../Graphics/Graphics";
import CircleCollider from "../Physics/CircleCollider";
import { Config } from "../config";
import { getColorString } from "../Graphics/Color";
import { initLeftEngine, initRightEngine, updateEngines } from "./utils";
import ShipConfig from "./config";
import { Stats } from "../Level/Stats";
import type { Viewport } from "@/Graphics/Viewport";
import type { DrawContext } from "@/Graphics/DrawContext";

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

    public draw(viewport: Viewport) {
        if (this.alive) {
            const drawContext: DrawContext = {
                viewport,
                pos: this.pos,
                rotation: this.rotation
            };

            const { ctx } = viewport;

            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = getColorString(this.color);

            Ship.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

            ctx.stroke();
            ctx.restore();

            this.engineLeft.draw(viewport);
            this.engineRight.draw(viewport);
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
}

export default Ship;
