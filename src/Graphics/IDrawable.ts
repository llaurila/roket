import type { Graphics } from "./Graphics";
import type { Viewport } from "./Viewport";

interface IDrawable {
    id: number;
    draw: (viewport: Viewport) => void;
    alive: boolean;
    graphics?: Graphics;
}

export default IDrawable;
