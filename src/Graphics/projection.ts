import type Vector from "../Physics/Vector";
import { getCenter } from "../Utils";
import type IDrawContext from "./IDrawContext";

export function toScreenCoordinates(v: Vector, drawContext: IDrawContext): Vector {
    const origin = getCenter(drawContext.ctx);
    const zoom = drawContext.camera.zoom;

    return v
        .mul(zoom)
        .add(origin)
        .add(drawContext.camera.pos.mul(-1 * zoom));
}
