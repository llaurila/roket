import Vector from "@/Physics/Vector";

export default class Rectangle {
    public topLeft: Vector;
    public size: Vector;

    public constructor(topLeft: Vector, size: Vector) {
        this.topLeft = topLeft;
        this.size = size;
    }

    public static get Zero() {
        return new Rectangle(
            Vector.Zero,
            Vector.Zero
        );
    }

    public get bottomRight() {
        return this.topLeft.add(this.size);
    }

    public contains(point: Vector): boolean {
        return (
            point.x >= this.topLeft.x &&
            point.x <= this.bottomRight.x &&
            point.y >= this.topLeft.y &&
            point.y <= this.bottomRight.y
        );
    }

    public fill(ctx: CanvasRenderingContext2D) {
        ctx.fillRect(this.topLeft.x, this.topLeft.y, this.size.x, this.size.y);
    }

    public stroke(ctx: CanvasRenderingContext2D) {
        ctx.strokeRect(this.topLeft.x, this.topLeft.y, this.size.x, this.size.y);
    }
}
