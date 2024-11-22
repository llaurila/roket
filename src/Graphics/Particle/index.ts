import Body from "../../Physics/Body";
import type IDrawable from "../IDrawable";
import type Camera from "../Camera";
import Vector from "../../Physics/Vector";
import { getCenter } from "../../Utils";
import type IDrawContext from "../IDrawContext";
import Polygon from "../Polygon";
import { getColorString, getInterpolatedColor } from "../Color";
import { FLAME } from "./flame";

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

    public toScreenCoordinates(drawContext: IDrawContext): Vector {
        const origin = getCenter(drawContext.ctx);
        const zoom = drawContext.camera.zoom;

        return this.pos
            .mul(zoom)
            .add(origin)
            .add(drawContext.camera.pos.mul(-1 * zoom));
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const color = getInterpolatedColor(FLAME, this.relativeAge);

        ctx.save();
        ctx.fillStyle = getColorString(color);

        Particle.Shape.mul(1 + this.relativeAge).toScreenCoordinates({
            pos: this.pos,
            rotation: this.rotation,
            ctx,
            camera
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
