import Pointer from "@/Controls/Pointer";
import Rectangle from "@/Graphics/Rectangle";
import type { Viewport } from "@/Graphics/Viewport";
import type UIDialog from ".";
import UniqueIdProvider from "@/UniqueIdProvider";
import Vector from "@/Physics/Vector";

const UI_COMPONENT_MARGIN = 8;

export default abstract class UIInputBase extends EventTarget {
    public static readonly MARGIN = UI_COMPONENT_MARGIN;

    public id: number = UniqueIdProvider.next();

    protected dialog: UIDialog;

    public constructor(dialog: UIDialog) {
        super();
        this.dialog = dialog;
    }

    protected isMouseOver(viewport: Viewport): boolean {
        if (!this.dialog.visible) return false;
        const mouse = Pointer.getPosition();
        const rect = this.getRect(viewport);
        return rect.contains(mouse);
    }

    protected getRect(viewport: Viewport): Rectangle {
        const parentRect = this.dialog.getContentRect(viewport);
        const width = parentRect.size.x - UIInputBase.MARGIN * 2;

        let offsetY = 0;
        let index = this.dialog.inputs.indexOf(this);
        while (--index > 0) {
            const curInput = this.dialog.inputs[index - 1];
            offsetY += curInput.height() + UIInputBase.MARGIN;
        }

        const pos = new Vector(
            parentRect.topLeft.x + UIInputBase.MARGIN,
            parentRect.topLeft.y + UIInputBase.MARGIN + offsetY
        );

        return new Rectangle(pos, new Vector(width, this.height()));
    }

    public abstract height(): number;

    public abstract draw(viewport: Viewport): void;

    public abstract update(viewport: Viewport): void;
}
