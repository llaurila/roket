import { getCenter } from "../Utils";
import IDrawContext from "../Graphics/IDrawContext";

class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(v2: Vector): Vector {
        return new Vector(
            this.x + v2.x,
            this.y + v2.y
        );
    }

    sub(v2: Vector): Vector {
        return new Vector(
            this.x - v2.x,
            this.y - v2.y
        );
    }

    mul(m: number): Vector {
        return new Vector(
            this.x * m,
            this.y * m
        );
    }

    div(d: number): Vector {
        return new Vector(
            this.x / d,
            this.y / d
        );
    }

    cross(v2: Vector): number {
        return this.x * v2.y - this.y * v2.x;
    }

    dot(v2: Vector): number {
        return this.x * v2.x +
            this.y * v2.y;
    }

    normalize(): Vector {
        return this.div(this.length());
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    rotate(theta: number): Vector {
        return new Vector(
            Math.cos(theta) * this.x - Math.sin(theta) * this.y,
            Math.sin(theta) * this.x + Math.cos(theta) * this.y
        );
    }

    floor(): Vector {
        return new Vector(
            Math.floor(this.x),
            Math.floor(this.y)
        );
    }

    ceil(): Vector {
        return new Vector(
            Math.ceil(this.x),
            Math.ceil(this.y)
        );
    }

    neg(): Vector {
        return new Vector(
            -this.x,
            -this.y
        );
    }

    toScreenCoordinates(drawContext: IDrawContext): Vector {
        const origin = getCenter(drawContext.ctx);
        const zoom = drawContext.camera.zoom;

        return this
            .mul(zoom)
            .add(origin)
            .add(drawContext.camera.pos.mul(-1 * zoom));
    }

    toString(decimals = 1): string {
        return `[${this.x.toFixed(decimals)}, ${this.y.toFixed(decimals)}]`;
    }

    static get Zero() {
        return new Vector(0, 0);
    }

    static get One() {
        return new Vector(1, 1);
    }

    static get Up() {
        return new Vector(0, 1);
    }
}

export default Vector;
