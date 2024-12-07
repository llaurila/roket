import Body from "../../Physics/Body";
import type IDrawable from "../IDrawable";
import Vector from "../../Physics/Vector";
import Polygon from "../Polygon";
import { getColorString, getInterpolatedColor } from "../Color";
import { FLAME } from "./flame";
import type { Viewport } from "../Viewport";

class Particle extends Body implements IDrawable {
    public static Shape: Polygon = new Polygon([
        new Vector(-1, -1),
        new Vector(+1, -1),
        new Vector(+1, +1),
        new Vector(-1, +1)
    ]);

    public age = 0;
    public ttl: number;

    public constructor(
        position: Vector,
        ttl: number,
        velocity: Vector,
        angularVelocity: number
    ) {
        super(position);

        if (ttl <= 0) {
            throw new Error("Time-to-live needs to be greater than zero.");
        }
        this.ttl = ttl;

        this.v = velocity;
        this.angularVelocity = angularVelocity;
        this.mass = 1;
        this.rotation = Math.random() * Math.PI;
    }

    public get relativeAge(): number {
        return this.age / this.ttl;
    }

    public get alive(): boolean {
        return this.age < this.ttl;
    }

    public toScreenCoordinates(viewport: Viewport): Vector {
        const origin = viewport.getCenter();
        const zoom = viewport.camera.zoom;

        return this.pos
            .mul(zoom)
            .add(origin)
            .add(viewport.camera.pos.mul(-1 * zoom));
    }

    public draw(viewport: Viewport) {
        const { ctx } = viewport;
        const color = getInterpolatedColor(FLAME, this.relativeAge);

        ctx.save();
        ctx.fillStyle = getColorString(color);

        Particle.Shape.mul(1 + this.relativeAge).toScreenCoordinates({
            viewport,
            pos: this.pos,
            rotation: this.rotation
        }).makeClosedPath(ctx);

        ctx.fill();
        ctx.restore();
    }

    public update(time: number, delta: number) {
        if (this.alive) {
            super.update(time, delta);
        }
        this.age += delta;
    }
}

export default Particle;
