import type Vector from "../Physics/Vector";

class Camera {
    public pos: Vector;
    public zoom: number;

    public constructor(position: Vector, zoom: number) {
        this.pos = position;
        this.zoom = zoom;
    }
}

export default Camera;
