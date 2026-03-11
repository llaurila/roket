import Vector from "../Physics/Vector";

let pos = Vector.Zero;
let leftPressed = false;

if (typeof window !== "undefined") {
    window.addEventListener("mousemove", (e: MouseEvent) => {
        pos = new Vector(e.x, e.y);
    });

    window.addEventListener("mousedown", () => {
        leftPressed = true;
    });

    window.addEventListener("mouseup", () => {
        leftPressed = false;
    });
}

export default {
    getPosition: () => pos,
    leftPressed: () => leftPressed
};
