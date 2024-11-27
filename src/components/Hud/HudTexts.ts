import type IDrawable from "@/Graphics/IDrawable";
import UniqueIdProvider from "@/UniqueIdProvider";
import type { GetColor} from "./HudItem";
import { DefaultColor, HudItem } from "./HudItem";
import { Config } from "@/config";
import { getColorString } from "@/Graphics/Color";

const OFFSET_X = 320;
const OFFSET_Y = 10;

export class HudTexts implements IDrawable {
    public id: number = UniqueIdProvider.next();
    private readonly _alive = true;
    private items: HudItem[] = [];

    public get alive() {
        return this._alive;
    }

    public add(getText: () => string, getColor: GetColor = DefaultColor) {
        this.items.push(new HudItem(getText, getColor));
    }

    public draw(ctx: CanvasRenderingContext2D) {
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
                    OFFSET_X,
                    OFFSET_Y + config.lineHeight * line
                );
                line++;
            }
        }

        ctx.restore();
    }
}
