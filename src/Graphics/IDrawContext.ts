import Vector from "../Physics/Vector";
import Camera from "./Camera";

interface IDrawContext {
    pos: Vector;
    rotation: number;
    ctx: CanvasRenderingContext2D;
    camera: Camera;
}

export default IDrawContext;
