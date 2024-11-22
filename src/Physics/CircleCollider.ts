import type Body from "./Body";
import type Vector from "./Vector";

class CircleCollider {
    public radius: number;

    public constructor(radius: number) {
        this.radius = radius;
    }

    public static check(a: Body, b: Body): boolean {
        if (a.circleCollider && b.circleCollider) {
            const distance = a.circleCollider.radius + b.circleCollider.radius;
            return a.pos.sub(b.pos).length() < distance;
        }
        return false;
    }

    public containsPoint(v: Vector): boolean {
        return v.length() <= this.radius;
    }
}

export default CircleCollider;
