import Body from "./Body";
import Vector from "./Vector";

class Triagle {
    a: Vector;
    b: Vector;
    c: Vector;

    constructor(a: Vector, b: Vector, c: Vector) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    getArea(): number {
        return Math.abs(
            (this.a.x * (this.b.y - this.c.y) +
            this.b.x * (this.c.y - this.a.y) +
            this.c.x * (this.a.y - this.b.y)) / 2
        );
    }
}

class TriangleCollider {
    pts: Triagle;

    constructor(a: Vector, b: Vector, c: Vector) {
        this.pts = new Triagle(a, b, c);
    }

    containsPoint(v: Vector): boolean {
        const TOLERANCE = 0.01;

        const t1 = new Triagle(v, this.pts.b, this.pts.c);
        const t2 = new Triagle(this.pts.a, v, this.pts.c);
        const t3 = new Triagle(this.pts.a, this.pts.b, v);

        return equals(
            this.pts.getArea(),
            t1.getArea() + t2.getArea() + t3.getArea(),
            TOLERANCE
        );
    }

    // eslint-disable-next-line complexity
    static check(a: Body, b: Body): boolean {
        if (a.triangleCollider && b.triangleCollider) {
            return a.triangleCollider.containsPoint(b.triangleCollider.pts.a) ||
                a.triangleCollider.containsPoint(b.triangleCollider.pts.b) ||
                a.triangleCollider.containsPoint(b.triangleCollider.pts.c) ||
                b.triangleCollider.containsPoint(a.triangleCollider.pts.a) ||
                b.triangleCollider.containsPoint(a.triangleCollider.pts.b) ||
                b.triangleCollider.containsPoint(a.triangleCollider.pts.c);
        }
        return false;
    }
}

function equals(a: number, b: number, tolerance: number) {
    return Math.abs(b - a) <= tolerance;
}

export default TriangleCollider;
