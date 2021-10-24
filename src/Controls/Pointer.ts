import Vector from "../Physics/Vector";

let pos = Vector.Zero;

window.addEventListener("mousemove", (e: MouseEvent) => {
    pos = new Vector(e.x, e.y);
});

export default {
    getPosition: () => pos
};
