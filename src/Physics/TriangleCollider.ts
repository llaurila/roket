import type Body from "./Body";
import type Vector from "./Vector";

class Triangle {
    public a: Vector;
    public b: Vector;
    public c: Vector;

    public constructor(a: Vector, b: Vector, c: Vector) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    public getArea(): number {
        return Math.abs(
            (this.a.x * (this.b.y - this.c.y) +
            this.b.x * (this.c.y - this.a.y) +
            this.c.x * (this.a.y - this.b.y)) / 2
        );
    }
}

class TriangleCollider {
    public pts: Triangle;

    public constructor(a: Vector, b: Vector, c: Vector) {
        this.pts = new Triangle(a, b, c);
    }

    // eslint-disable-next-line complexity 
    public static check(a: Body, b: Body): boolean {
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

    public containsPoint(v: Vector): boolean {
        const TOLERANCE = 0.01;

        const t1 = new Triangle(v, this.pts.b, this.pts.c);
        const t2 = new Triangle(this.pts.a, v, this.pts.c);
        const t3 = new Triangle(this.pts.a, this.pts.b, v);

        return equals(
            this.pts.getArea(),
            t1.getArea() + t2.getArea() + t3.getArea(),
            TOLERANCE
        );
    }
}

function equals(a: number, b: number, tolerance: number) {
    return Math.abs(b - a) <= tolerance;
}

export default TriangleCollider;
