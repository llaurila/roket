import { Config } from "@/config";
import Pointer from "@/Controls/Pointer";
import { getColorString } from "@/Graphics/Color";
import Rectangle from "@/Graphics/Rectangle";
import type { Viewport } from "@/Graphics/Viewport";
import Vector from "@/Physics/Vector";
import { makeBgGradient } from "./utils";

const BUTTON_HEIGHT = 56;
const BUTTON_GAP = 16;
const FONT_SIZE = 18;

export interface AlertAction {
    text: string;
    primary?: boolean;
    onSelect: () => void;
}

export default class AlertActions {
    public items: AlertAction[] = [];

    private ready = false;
    private lastPressId = Pointer.getPressId();
    private pendingAction?: AlertAction;
    private selected = false;

    public get height(): number {
        return this.items.length === 0 ? 0 : BUTTON_HEIGHT + BUTTON_GAP;
    }

    public getButtonRect(contentRect: Rectangle, index: number): Rectangle {
        const padding = Config.ui.alert.padding;
        const width = (contentRect.size.x - padding * 2 -
            BUTTON_GAP * (this.items.length - 1)) / this.items.length;

        return new Rectangle(
            new Vector(
                contentRect.topLeft.x + padding + index * (width + BUTTON_GAP),
                contentRect.bottomRight.y - padding - BUTTON_HEIGHT
            ),
            new Vector(width, BUTTON_HEIGHT)
        );
    }

    public update(contentRect: Rectangle): void {
        if (this.selected) return;
        if (!this.ready) {
            this.lastPressId = Pointer.getPressId();
            this.ready = this.isReleased();
            return;
        }

        this.capturePress(contentRect);
        if (!this.isReleased()) return;

        const action = this.pendingAction;
        this.pendingAction = undefined;
        if (action) {
            this.selected = true;
            action.onSelect();
        }
    }

    public draw(viewport: Viewport, contentRect: Rectangle): void {
        for (const [index, action] of this.items.entries()) {
            this.drawButton(viewport.ctx, this.getButtonRect(contentRect, index), action);
        }
    }

    private capturePress(contentRect: Rectangle): void {
        const pressId = Pointer.getPressId();
        if (pressId === 0 || pressId === this.lastPressId) return;

        this.lastPressId = pressId;
        this.pendingAction = this.items.find((_, index) =>
            this.getButtonRect(contentRect, index).contains(Pointer.getPressPosition()));
    }

    private isReleased(): boolean {
        return Pointer.getActiveTouchCount() === 0 && !Pointer.leftPressed();
    }

    private drawButton(ctx: CanvasRenderingContext2D, rect: Rectangle, action: AlertAction): void {
        ctx.fillStyle = action.primary
            ? getColorString(Config.ui.window.titleBackgroundColor)
            : makeBgGradient(ctx, rect);
        rect.fill(ctx);
        ctx.strokeStyle = getColorString(Config.ui.window.borderColor);
        ctx.lineWidth = action.primary ? 2 : 1;
        rect.stroke(ctx);

        ctx.font = `${action.primary ? "bold " : ""}${FONT_SIZE}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = getColorString(Config.typography.defaultColor);
        ctx.fillText(action.text, rect.topLeft.x + rect.size.x / 2,
            rect.topLeft.y + rect.size.y / 2, rect.size.x - BUTTON_GAP);
    }
}
