import type { Graphics } from "./Graphics/Graphics";
import { getColorString } from "./Graphics/Color";
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

export interface IMeteorOptions {
    diameter: number;
    mass: number;
    velocity?: Vector;
    angularVelocity?: number;
    cornerCount?: number;
}

class Meteor extends Body implements IDrawable {
    public graphics?: Graphics;
    public readonly diameter: number;
    public readonly shape: Polygon;
    public readonly cornerCount: number;
    public circleCollider: CircleCollider;

    public constructor(position: Vector, options: IMeteorOptions, rng: RNG) {
        super(position);

        this.diameter = options.diameter;
        this.mass = options.mass;
        this.v = options.velocity ?? Vector.Zero;
        this.angularVelocity = options.angularVelocity ?? 0;
        this.cornerCount = options.cornerCount ??
            rng.nextInt(config.cornerCountMin, config.cornerCountMax);
        this.circleCollider = new CircleCollider(this.diameter / 2);
        this.shape = createShape(this.diameter, this.cornerCount, rng);

        this.onCollision(e => {
            if (e.target instanceof Ship && e.target.alive) {
                e.target.die();
            }
        });
    }

    public draw(viewport: Viewport): void {
        const { ctx } = viewport;

        ctx.save();
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = getColorString(config.color);

        this.shape.toScreenCoordinates({
            viewport,
            pos: this.pos,
            rotation: this.rotation
        }).makeClosedPath(ctx);

        ctx.stroke();
        ctx.restore();
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

