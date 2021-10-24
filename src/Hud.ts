import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import { getCenter } from "./Utils";
import Vector from "./Physics/Vector";
import Ship from "./Ship";
import UniqueIdProvider from "./UniqueIdProvider";
import PhysicsEngine from "./Physics/PhysicsEngine";
import Fuel from "./Fuel";
import IUpdatable from "./Physics/IUpdatable";
import Body from "./Physics/Body";
import { getColorHexFromRGBA, getGrayHex } from "./Graphics/Color";

const FONT_SIZE = 14;
const LINE_HEIGHT = 18;
const RADAR_MARGIN = 20;
const RADAR_CIRCLE_OPACITY = 0.25;

class Hud implements IDrawable {
    id: number = UniqueIdProvider.next();
    items: HudItem[] = [];
    ship: Ship;
    physics: PhysicsEngine;

    constructor(ship: Ship, physics: PhysicsEngine) {
        this.ship = ship;
        this.physics = physics;
    }

    // eslint-disable-next-line class-methods-use-this
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
        ) / 2 - RADAR_MARGIN;

        ctx.save();

        ctx.strokeStyle = getGrayHex(1, RADAR_CIRCLE_OPACITY);
        ctx.beginPath();
        ctx.arc(center.x, center.y, size, 0, 2 * Math.PI);
        ctx.stroke();

        const from = this.ship.pos;

        const drawDot = (to: Vector, color: string) => {
            const RADIUS = 4;

            if (camera.toScreenCoordinates(ctx, to).sub(center).length() > size) {
                const direction = to.sub(from).normalize();
                const fuelArrow = center.add(flipY(direction.mul(size)));

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(fuelArrow.x, fuelArrow.y, RADIUS, 0, 2 * Math.PI);
                ctx.fill();
            }
        };

        const nearestShip = this.getNearestObject(obj => obj instanceof Ship &&
            obj != this.ship);

        if (nearestShip) {
            drawDot(nearestShip.pos, getColorHexFromRGBA(1, 0, 1, 0.5));
        }

        const nearestFuel = this.getNearestObject(obj => obj instanceof Fuel);

        if (nearestFuel) {
            drawDot(nearestFuel.pos, getColorHexFromRGBA(0, 1, 0, 0.5));
        }

        ctx.restore();
    }

    getNearestObject(criteria: (obj: IUpdatable) => boolean): Body|undefined {
        const from = this.ship.pos;

        const objects = this.physics
            .filter(obj => obj.alive && obj instanceof Body)
            .filter(criteria)
            .map(obj => <Body>obj)
            .sort((a, b) => a.pos.sub(from).length() - b.pos.sub(from).length());

        if (objects.length > 0) {
            return objects[0];
        }

        return undefined;
    }

    drawTexts(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.font = `${FONT_SIZE}px Nunito`;
        ctx.fillStyle = "#f0f0f0";
        ctx.textBaseline = "top";

        let line = 0;
        for (const item of this.items) {
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
    // eslint-disable-next-line class-methods-use-this
    enabled: () => boolean = () => true;

    constructor(getText: () => string, enabled = () => true) {
        this.getText = getText;
        this.enabled = enabled;
    }
}

const flipY = (v: Vector) => new Vector(v.x, -v.y);

export { Hud };
