import Vector from "../Physics/Vector";
import type { DrawContext } from "./DrawContext";

class Polygon {
    public pts: Vector[];

    public constructor(points: Vector[]) {
        this.pts = points;
    }

    public get first(): Vector {
        return this.pts[0];
    }

    public static make(pts: number[]): Polygon {
        const v: Vector[] = [];

        for (let i = 0; i < pts.length; i += 2) {
            v.push(new Vector(
                pts[i],
                pts[i + 1]
            ));
        }

        return new Polygon(v);
    }

    public translate(v: Vector): Polygon {
        return new Polygon(
            this.pts.map(v_ => v_.add(v))
        );
    }

    public mul(m: number): Polygon {
        return new Polygon(
            this.pts.map(v => v.mul(m))
        );
    }

    public scale(x: number, y: number): Polygon {
        return new Polygon(
            this.pts.map(v => new Vector(
                v.x * x,
                v.y * y
            ))
        );
    }

    public rotate(theta: number): Polygon {
        return new Polygon(
            this.pts.map(v => v.rotate(theta))
        );
    }

    public toScreenCoordinates(drawContext?: DrawContext): Polygon {
        if (!drawContext) {
            return this.scale(1, -1);
        }

        const { viewport } = drawContext;

        const origin = viewport.getCenter();
        const zoom = viewport.camera.zoom;

        return this
            .toWorldCoordinates(drawContext)
            .mul(zoom)
            .translate(origin)
            .translate(viewport.camera.pos.mul(-1 * zoom));
    }

    public toWorldCoordinates(drawContext: DrawContext): Polygon {
        return this
            .rotate(drawContext.rotation)
            .translate(drawContext.pos);
    }

    public makeClosedPath(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();

        ctx.moveTo(this.first.x, this.first.y);

        for (let i = 1; i < this.pts.length; i++) {
            ctx.lineTo(
                this.pts[i].x,
                this.pts[i].y
            );
        }

        ctx.closePath();
    }
}

export default Polygon;
