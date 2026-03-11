import type { Graphics } from "./Graphics/Graphics";
import { getColorString, getInterpolatedColor, type IColor } from "./Graphics/Color";
import ExplosionParticleEngine from "./Graphics/ExplosionParticleEngine";
import type IDrawable from "./Graphics/IDrawable";
import Polygon from "./Graphics/Polygon";
import type { Viewport } from "./Graphics/Viewport";
import Body from "./Physics/Body";
import CircleCollider from "./Physics/CircleCollider";
import Vector from "./Physics/Vector";
import RNG from "./RNG";
import Ship from "./Ship";
import { Config } from "./config";

const config = Config.meteor;

const HOT_COLOR: IColor = {
    R: 1,
    G: 0.1,
    B: 0.1,
    A: 1
};

export interface IMeteorOptions {
    diameter: number;
    mass: number;
    velocity?: Vector;
    angularVelocity?: number;
    cornerCount?: number;
    strength?: number;
}

class Meteor extends Body implements IDrawable {
    public graphics?: Graphics;
    public readonly diameter: number;
    public readonly shape: Polygon;
    public readonly cornerCount: number;
    public readonly strength: number;
    public circleCollider: CircleCollider;

    private heat = 0;

    public constructor(position: Vector, options: IMeteorOptions, rng: RNG) {
        super(position);

        this.diameter = options.diameter;
        this.mass = options.mass;
        this.strength = options.strength ?? config.strength;
        this.v = options.velocity ?? Vector.Zero;
        this.angularVelocity = options.angularVelocity ?? 0;
        this.cornerCount = options.cornerCount ??
            rng.nextInt(config.cornerCountMin, config.cornerCountMax);
        this.circleCollider = new CircleCollider(this.diameter / 2);
        this.shape = createShape(this.diameter, this.cornerCount, rng);

        if (this.strength <= 0) {
            throw new Error("Meteor strength must be > 0.");
        }

        this.onCollision(e => {
            if (e.target instanceof Ship && e.target.alive) {
                e.target.die();
            }
        });
    }

    public applyLaserHeat(delta: number): void {
        if (!this.alive || delta <= 0) {
            return;
        }

        this.heat += delta / this.strength;

        if (this.heat >= 1) {
            this.explodeFromHeat();
        }
    }

    public draw(viewport: Viewport): void {
        const { ctx } = viewport;

        ctx.save();
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = getColorString(this.getDisplayColor());

        this.shape.toScreenCoordinates({
            viewport,
            pos: this.pos,
            rotation: this.rotation
        }).makeClosedPath(ctx);

        ctx.stroke();
        ctx.restore();
    }

    private getDisplayColor(): IColor {
        return getInterpolatedColor([
            { Color: config.color, Pos: 0 },
            { Color: HOT_COLOR, Pos: 1 }
        ], Math.min(1, this.heat));
    }

    private explodeFromHeat(): void {
        this.spawnExplosion();
        this.spawnFragments();
        this._alive = false;
    }

    private spawnExplosion(): void {
        if (!this.physics || !this.graphics) {
            return;
        }

        const explosion = new ExplosionParticleEngine(this.pos, {
            particleCount: config.explosionParticleCount,
            velocityMin: 0,
            velocityMax: config.explosionVelocityMax,
            originVelocity: this.v
        });

        this.physics.add(explosion);
        this.graphics.add(explosion);
    }

    private spawnFragments(): void {
        const fragmentDiameter = this.diameter / 2;

        if (fragmentDiameter < config.minDiameter || !this.physics) {
            return;
        }

        const axis = this.getSplitAxis();
        const offset = fragmentDiameter / 2 + config.splitGap;

        const fragmentA = this.createFragment(
            this.pos.add(axis.mul(offset)),
            this.v.add(axis.mul(config.splitDriftSpeed)),
            this.angularVelocity + this.getSplitSpin("a"),
            "a"
        );

        const fragmentB = this.createFragment(
            this.pos.sub(axis.mul(offset)),
            this.v.sub(axis.mul(config.splitDriftSpeed)),
            this.angularVelocity + this.getSplitSpin("b"),
            "b"
        );

        this.physics.add(fragmentA);
        this.physics.add(fragmentB);

        if (this.graphics) {
            this.graphics.add(fragmentA);
            this.graphics.add(fragmentB);
        }
    }

    private createFragment(
        position: Vector,
        velocity: Vector,
        angularVelocity: number,
        key: string
    ): Meteor {
        return new Meteor(position, {
            diameter: this.diameter / 2,
            mass: this.mass / 2,
            velocity,
            angularVelocity,
            strength: this.strength
        }, this.getSplitRng(key));
    }

    private getSplitAxis(): Vector {
        const angle = this.getSplitRng("axis").next(0, Math.PI * 2);
        return Vector.UnitX.rotate(angle);
    }

    private getSplitSpin(key: string): number {
        return this.getSplitRng(`spin-${key}`).next(-0.5, 0.5);
    }

    private getSplitRng(key: string): RNG {
        return new RNG(RNG.deriveSeed(this.id, key));
    }
}

function createShape(diameter: number, cornerCount: number, rng: RNG): Polygon {
    const radius = diameter / 2;
    const startAngle = rng.next(0, Math.PI * 2);
    const step = Math.PI * 2 / cornerCount;
    const points: Vector[] = [];

    for (let i = 0; i < cornerCount; i++) {
        const angle = startAngle + step * i;
        const vertexRadius = radius * rng.next(
            config.vertexRadiusMinRelative,
            config.vertexRadiusMaxRelative
        );

        points.push(Vector.Up.rotate(angle).mul(vertexRadius));
    }

    return new Polygon(points);
}

export default Meteor;

