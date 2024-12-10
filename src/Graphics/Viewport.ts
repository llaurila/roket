import Vector from "@/Physics/Vector";
import type Camera from "./Camera";

export class Viewport {
    private _width: number;
    private _height: number;

    public constructor(private _ctx: CanvasRenderingContext2D, private _camera: Camera) {
        this._width = _ctx.canvas.width;
        this._height = _ctx.canvas.height;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get ctx(): CanvasRenderingContext2D {
        return this._ctx;
    }

    public get camera(): Camera {
        return this._camera;
    }

    public getCenter = () => new Vector(this.width / 2, this.height / 2);

    public update(): void {
        this._width = this._ctx.canvas.width  = window.innerWidth;
        this._height = this._ctx.canvas.height = window.innerHeight;
    }

    public toScreenCoordinates(p: Vector): Vector {
        const { zoom, pos } = this._camera;

        return p
            .mul(zoom)
            .add(this.getCenter())
            .add(pos.mul(-1 * zoom));
    }

    public toScreenScale(scale: number): number {
        return scale * this.camera.zoom;
    }

    public toWorldCoordinates(p: Vector): Vector {
        const origin = this.getOrigin();
        return flipY(p.sub(origin)).div(this.camera.zoom);
    }

    public getOrigin(): Vector {
        const { ctx } = this;
        return new Vector(
            ctx.canvas.width / 2,
            ctx.canvas.height / 2
        ).sub(flipY(this.camera.pos).mul(this.camera.zoom));
    }
}

const flipY = (v: Vector) => new Vector(v.x, -v.y);
