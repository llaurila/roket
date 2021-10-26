import Vector from "../Physics/Vector";

export default class Rectangle {
    topLeft: Vector;
    size: Vector;

    constructor(topLeft: Vector, size: Vector) {
        this.topLeft = topLeft;
        this.size = size;
    }

    fill(ctx: CanvasRenderingContext2D) {
        ctx.fillRect(this.topLeft.x, this.topLeft.y, this.size.x, this.size.y);
    }

    stroke(ctx: CanvasRenderingContext2D) {
        ctx.strokeRect(this.topLeft.x, this.topLeft.y, this.size.x, this.size.y);
    }

    static get Zero() {
        return new Rectangle(
            Vector.Zero,
            Vector.Zero
        );
    }
}
