import Vector from "./Vector";
import { getCenter } from "./Utils";
import IDrawContext from "./IDrawContext";

class Polygon {
    pts: Vector[];

    constructor(points: Vector[]) {
        this.pts = points;
    }

    get first(): Vector {
        return this.pts[0];
    }

    translate(v: Vector): Polygon {
        return new Polygon(
            this.pts.map(v_ => v_.add(v))
        )
    }

    mul(m: number): Polygon {
        return new Polygon(
            this.pts.map(v => v.mul(m))
        )
    }

    scale(x: number, y: number): Polygon {
        return new Polygon(
            this.pts.map(v => new Vector(
                v.x * x,
                v.y * y
            ))
        )
    }

    rotate(theta: number): Polygon {
        return new Polygon(
            this.pts.map(v => v.rotate(theta))
        );
    }

    toScreenCoordinates(drawContext?: IDrawContext): Polygon {
        if (drawContext == undefined) {
            return this.scale(1, -1);
        }

        const origin = getCenter(drawContext.ctx);
        const zoom = drawContext.camera.zoom;

        return this
            .toWorldCoordinates(drawContext)
            .mul(zoom)
            .translate(origin)
            .translate(drawContext.camera.pos.mul(-1 * zoom));
    }

    toWorldCoordinates(drawContext: IDrawContext): Polygon {
        return this
            .rotate(drawContext.rotation)
            .translate(drawContext.pos);
    }

    makeClosedPath(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();

        ctx.moveTo(this.first.x, this.first.y);

        for (let i = 1; i < this.pts.length; i++) {
            ctx.lineTo(
                this.pts[i].x,
                this.pts[i].y
            )
        }

        ctx.closePath();
    }

    static Make(pts: number[]): Polygon {
        let v: Vector[] = [];

        for (let i = 0; i < pts.length; i += 2) {
            v.push(new Vector(
                pts[i],
                pts[i+1]
            ));
        }

        return new Polygon(v);
    }
}

export default Polygon;