import IDrawable from "../Graphics/IDrawable";
import UniqueIdProvider from "../UniqueIdProvider";
import { DefaultColor, GetColor, HudItem } from "./HudItem";
import { Config } from "../config";
import { getColorString } from "../Graphics/Color";

export class HudTexts implements IDrawable {
    id: number = UniqueIdProvider.next();
    private readonly _alive = true;
    private items: HudItem[] = [];

    get alive() {
        return this._alive;
    }

    add(getText: () => string, getColor: GetColor = DefaultColor) {
        this.items.push(new HudItem(getText, getColor));
    }

    draw(ctx: CanvasRenderingContext2D) {
        const { hud: config } = Config;

        ctx.save();
        ctx.font = `${config.fontSize}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "top";

        let line = 0;
        for (const item of this.items) {
            const color = item.getColor();
            if (color != null) {
                ctx.fillStyle = getColorString(color);

                ctx.fillText(
                    this.items[line].getText(),
                    10,
                    10 + config.lineHeight * line
                );
                line++;
            }
        }

        ctx.restore();
    }
}
