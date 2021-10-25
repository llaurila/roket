import IDrawable from "../Graphics/IDrawable";
import UniqueIdProvider from "../UniqueIdProvider";
import { AlwaysEnabled, EnabledSolver, HudItem } from "./HudItem";
import { Config } from "../config";
import { getColorHex } from "../Graphics/Color";

export class HudTexts implements IDrawable {
    id: number = UniqueIdProvider.next();
    private readonly _alive = true;
    private items: HudItem[] = [];

    get alive() {
        return this._alive;
    }

    add(getText: () => string, enabled: EnabledSolver = AlwaysEnabled) {
        this.items.push(new HudItem(getText, enabled));
    }

    draw(ctx: CanvasRenderingContext2D) {
        const { hud: config } = Config;

        ctx.save();
        ctx.font = `${config.fontSize}px ${Config.typography.fontFamily}`;
        ctx.fillStyle = getColorHex(Config.typography.defaultColor);
        ctx.textBaseline = "top";

        let line = 0;
        for (const item of this.items) {
            if (item.enabled()) {
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
