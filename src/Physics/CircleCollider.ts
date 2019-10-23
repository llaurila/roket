import Body from "./Body";
import Vector from "./Vector";

class CircleCollider {
    radius: number;
    
    constructor(radius: number) {
        this.radius = radius;
    }

    containsPoint(v: Vector): boolean {
        return v.length() <= this.radius;
    }

    static check(a: Body, b: Body): boolean {
        if (a.circleCollider && b.circleCollider) {
            const distance = a.circleCollider.radius + b.circleCollider.radius;
            return a.pos.sub(b.pos).length() < distance;
        }
        return false;
    }
}

export default CircleCollider;