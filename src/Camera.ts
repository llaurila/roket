import Vector from "./Vector";

class Camera {
    pos: Vector;
    zoom: number;

    constructor(position: Vector, zoom: number) {
        this.pos = position;
        this.zoom = zoom;
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