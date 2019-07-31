import IDrawable from "./IDrawable";
import Camera from "./Camera";
import { getCenter } from "./Utils";
import Vector from "./Vector";
import Fuel from "./Fuel";
import Ship from "./Ship";
import UniqueIdProvider from "./UniqueIdProvider";

const FONT_SIZE = 14;
const LINE_HEIGHT = 18;

class Hud implements IDrawable {
    id: number = UniqueIdProvider.next();
    items: HudItem[] = [];
    ship: Ship;
    fuelCapsule: Fuel;

    constructor(ship: Ship, fuelCapsule: Fuel) {
        this.ship = ship;
        this.fuelCapsule = fuelCapsule;
    }

    get alive() {
        return true;
    }

    add(getText: () => string, enabled = () => true) {
        this.items.push(new HudItem(getText, enabled));
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        ctx.save();
        ctx.resetTransform();

        this.drawRadar(ctx, camera);
        this.drawTexts(ctx);

        ctx.restore();
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

        let line = 0;
        for (let item of this.items) {
            if (item.enabled()) {
                ctx.fillText(this.items[line].getText(), 10, 10 + LINE_HEIGHT * line);
                line++;
            }
        }

        ctx.restore();
    }
}

class HudItem {
    getText: () => string;
    enabled: () => boolean = () => true;

    constructor(getText: () => string, enabled = () => true) {
        this.getText = getText;
        this.enabled = enabled;
    }
}

const flipY = (v: Vector) => new Vector(v.x, -v.y);

export { Hud };