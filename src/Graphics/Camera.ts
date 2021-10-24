import Vector from "../Physics/Vector";
import { getCenter } from "../Utils";

class Camera {
    pos: Vector;
    zoom: number;

    constructor(position: Vector, zoom: number) {
        this.pos = position;
        this.zoom = zoom;
    }

    toScreenCoordinates(ctx: CanvasRenderingContext2D, p: Vector): Vector {
        return p
            .mul(this.zoom)
            .add(getCenter(ctx))
            .add(this.pos.mul(-1 * this.zoom));
    }

    toWorldCoordinates(ctx: CanvasRenderingContext2D, p: Vector): Vector {
        const origin = this.getOrigin(ctx);
        return flipY(p.sub(origin)).div(this.zoom);
    }

    getOrigin(ctx: CanvasRenderingContext2D): Vector {
        return new Vector(
            ctx.canvas.width / 2,
            ctx.canvas.height / 2
        ).sub(flipY(this.pos).mul(this.zoom));
    }
}

const flipY = (v: Vector) => new Vector(v.x, -v.y);

export default Camera;
