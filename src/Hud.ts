import IDrawable from "./IDrawable";
import Camera from "./Camera";
import { getCenter } from "./Utils";
import Polygon from "./Polygon";
import Shapes from "./Shapes";
import Vector from "./Vector";
import Fuel from "./Fuel";
import Ship from "./Ship";

const FONT_SIZE = 14;
const LINE_HEIGHT = 18;

class Hud implements IDrawable {
    items: (() => string)[] = [];
    ship: Ship;
    fuelCapsule: Fuel;

    constructor(ship: Ship, fuelCapsule: Fuel) {
        this.ship = ship;
        this.fuelCapsule = fuelCapsule;
    }

    get alive() {
        return true;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        this.drawRadar(ctx, camera);
        this.drawTexts(ctx);
    }

    drawRadar(ctx: CanvasRenderingContext2D, camera: Camera): void {
        const center = getCenter(ctx);
        const size = Math.min(
            ctx.canvas.width,
            ctx.canvas.height
        ) / 2 - 20;

        const from = this.ship.pos;
        const to = this.fuelCapsule.pos;
        const direction = to.sub(from).normalize();
        const fuelArrow = center.add(flipY(direction.mul(size)));

        ctx.save();
        
        ctx.strokeStyle = `rgba(255, 255, 255, 0.25)`;
        ctx.beginPath();
        ctx.arc(center.x, center.y, size, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = `rgba(0, 255, 0, 0.5)`;
        ctx.beginPath();
        ctx.arc(fuelArrow.x, fuelArrow.y, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }

    drawTexts(ctx: CanvasRenderingContext2D): void {
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

const flipY = (v: Vector) => new Vector(v.x, -v.y);

export default Hud;