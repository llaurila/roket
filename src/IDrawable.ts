import Camera from "./Camera";
import { Graphics } from "./Graphics";

interface IDrawable {
    id: number;
    draw: (ctx: CanvasRenderingContext2D, camera: Camera) => void;
    alive: boolean;
    graphics?: Graphics;
}

export default IDrawable;