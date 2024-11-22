import type Camera from "./Camera";
import type { Graphics } from "./Graphics";

interface IDrawable {
    id: number;
    draw: (ctx: CanvasRenderingContext2D, camera: Camera) => void;
    alive: boolean;
    graphics?: Graphics;
}

export default IDrawable;
