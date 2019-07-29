import IDrawable from "./IDrawable";
import Camera from "./Camera";

class Fuel implements IDrawable {
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        
    }

    get alive() {
        return true;
    }
}

export default Fuel;