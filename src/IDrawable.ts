import Camera from "./Camera";

interface IDrawable {
    draw: (ctx: CanvasRenderingContext2D, camera: Camera) => void;
    alive: boolean;
}

export default IDrawable;