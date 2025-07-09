import { UIWindow } from "../UIWindow";
import { Config } from "@/config";
import { MenuItem } from "./MenuItem";
import type { Viewport } from "@/Graphics/Viewport";

const config = Config.ui.mainMenu;

export class Menu extends UIWindow {
    public items: MenuItem[] = [];

    public constructor(title = "MENU") {
        super(config.windowWidth, 0);
        this.title = title;
    }

    public addItem(caption: string): MenuItem {
        const item = new MenuItem(caption, this);
        this.items.push(item);
        return item;
    }

    public draw(viewport: Viewport) {
        if (!this.visible) return;

        const { ctx } = viewport;

        ctx.save();
        ctx.resetTransform();

        this.setContentHeight(this.getContentHeight());

        super.draw(viewport);

        ctx.globalAlpha = this.opacity;

        const rect = this.getContentRect(viewport);
        ctx.translate(rect.topLeft.x, rect.topLeft.y);

        for (const item of this.items) {
            item.update(viewport);
            item.draw(viewport);
            ctx.translate(0, item.getHeight());
        }

        ctx.restore();
    }

    private getContentHeight(): number {
        return this.items.reduce((acc, item) => acc + item.getHeight(), 0);
    }
}
