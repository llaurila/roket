import Camera from "./Camera";

interface IDrawable {
    draw: (ctx: CanvasRenderingContext2D, camera: Camera) => void;
}

export default IDrawable;