import Camera from "./Camera";

interface IDrawable {
    id: number;
    draw: (ctx: CanvasRenderingContext2D, camera: Camera) => void;
    alive: boolean;
}

export default IDrawable;