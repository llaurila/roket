import IDrawable from "./IDrawable";
import Camera from "./Camera";

const FONT_SIZE = 14;
const LINE_HEIGHT = 18;

class Hud implements IDrawable {
    items: (() => string)[] = [];

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        ctx.save();
        ctx.font = `${FONT_SIZE}px Nunito`;
        ctx.fillStyle = "#f0f0f0";
        ctx.textBaseline = "top";

        for (let line = 0; line < this.items.length; line++) {
            ctx.fillText(this.items[line](), 10, 10 + LINE_HEIGHT * line);
        }

        ctx.restore();
    }
}

export default Hud;