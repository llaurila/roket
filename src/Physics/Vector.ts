class Vector {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static get Zero() {
        return new Vector(0, 0);
    }

    public static get One() {
        return new Vector(1, 1);
    }

    public static get Up() {
        return new Vector(0, 1);
    }

    public static get Down() {
        return new Vector(0, -1);
    }

    public static get UnitX() {
        return new Vector(1, 0);
    }

    public static get UnitY() {
        return new Vector(0, 1);
    }

    public static fromCoords(coords: { x: number, y: number }): Vector {
        return new Vector(coords.x, coords.y);
    }

    public add(v2: Vector): Vector {
        return new Vector(
            this.x + v2.x,
            this.y + v2.y
        );
    }

    public sub(v2: Vector): Vector {
        return new Vector(
            this.x - v2.x,
            this.y - v2.y
        );
    }

    public mul(m: number): Vector {
        return new Vector(
            this.x * m,
            this.y * m
        );
    }

    public div(d: number): Vector {
        return new Vector(
            this.x / d,
            this.y / d
        );
    }

    public cross(v2: Vector): number {
        return this.x * v2.y - this.y * v2.x;
    }

    public dot(v2: Vector): number {
        return this.x * v2.x +
            this.y * v2.y;
    }

    public normalize(): Vector {
        return this.div(this.length());
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public rotate(theta: number): Vector {
        return new Vector(
            Math.cos(theta) * this.x - Math.sin(theta) * this.y,
            Math.sin(theta) * this.x + Math.cos(theta) * this.y
        );
    }

    public floor(): Vector {
        return new Vector(
            Math.floor(this.x),
            Math.floor(this.y)
        );
    }

    public ceil(): Vector {
        return new Vector(
            Math.ceil(this.x),
            Math.ceil(this.y)
        );
    }

    public neg(): Vector {
        return new Vector(
            -this.x,
            -this.y
        );
    }

    public toString(decimals = 1): string {
        return `[${this.x.toFixed(decimals)}, ${this.y.toFixed(decimals)}]`;
    }
}

export default Vector;
