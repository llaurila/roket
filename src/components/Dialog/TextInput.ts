import UniqueIdProvider from "@/UniqueIdProvider";
import Pointer from "@/Controls/Pointer";
import { getColorString } from "@/Graphics/Color";
import { Config } from "@/config";
import Rectangle from "@/Graphics/Rectangle";
import Vector from "@/Physics/Vector";
import { makeBgGradient } from "../UIWindow/utils";
import type { Viewport } from "@/Graphics/Viewport";
import type UIDialog from "./index";

const HEIGHT = 30;
const MARGIN = 8;
const PADDING_X = 10;
const PADDING_Y = 5;
const FONT_SIZE = Config.typography.messageFontSize;
const DEFAULT_MAX_LENGTH = 255;

export default class UITextInput extends EventTarget {
    public id: number = UniqueIdProvider.next();
    public alive = true;

    public maxLength = DEFAULT_MAX_LENGTH;

    private mouseWasDown = false;
    private focused = false;
    private _value: string;

    public constructor(private dialog: UIDialog, value = "") {
        super();
        this._value = value;
        window.addEventListener("keydown", this.keyHandler);
    }

    public get value() { return this._value; }
    public set value(v: string) { this._value = v; }

    public focus() { this.focused = true; }
    public blur() { this.focused = false; }

    public draw(viewport: Viewport) {
        const { ctx } = viewport;
        const rect = this.getRect(viewport);

        ctx.save();
        ctx.fillStyle = makeBgGradient(ctx, rect);
        rect.fill(ctx);

        ctx.strokeStyle = getColorString(Config.ui.window.borderColor);
        ctx.lineWidth = Config.ui.window.borderWidth;
        rect.stroke(ctx);

        ctx.font = `${FONT_SIZE}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = getColorString(Config.typography.defaultColor);
        ctx.fillText(this._value, rect.topLeft.x + PADDING_X, rect.topLeft.y + rect.size.y / 2);

        if (this.focused) {
            const width = ctx.measureText(this._value).width;
            ctx.fillRect(
                rect.topLeft.x + PADDING_X + width + 2,
                rect.topLeft.y + PADDING_Y,
                1,
                rect.size.y - PADDING_Y * 2
            );
        }

        ctx.restore();

        this.update(viewport);
    }

    public update(viewport: Viewport) {
        const mouseIsDown = Pointer.leftPressed();
        const mouseOver = this.isMouseOver(viewport);

        const shouldGetFocus = () => mouseOver && mouseIsDown && !this.mouseWasDown;
        const shouldLoseFocus = () => !mouseOver && mouseIsDown && !this.mouseWasDown;

        if (shouldGetFocus()) {
            this.focused = true;
        }
        else if (shouldLoseFocus()) {
            this.focused = false;
        }

        this.mouseWasDown = mouseIsDown;
    }

    public getHeight(): number { return HEIGHT; }

    private readonly keyHandler = (e: KeyboardEvent) => {
        if (!this.focused) return;
        this.handleKey(e.key);
    };

    private handleKey(key: string) {
        const keys: Record<string, () => void> = {
            "Backspace": () => this._value = this._value.slice(0, -1),
            "Enter": () => this.dispatchEvent(new Event("enter")),
        };

        if (keys[key]) {
            keys[key]();
            return;
        }

        this.handleInputKey(key);
    }

    private handleInputKey(key: string) {
        if (key.length === 1) {
            const ch = key.toUpperCase();
            if (/^[A-Z0-9]$/.test(ch) && this._value.length < this.maxLength) {
                this._value += ch;
            }
        }
    }

    private getRect(viewport: Viewport): Rectangle {
        const parentRect = this.dialog.getContentRect(viewport);
        const width = parentRect.size.x - MARGIN * 2;
        const pos = new Vector(
            parentRect.topLeft.x + MARGIN,
            parentRect.topLeft.y + MARGIN + this.dialog.textInputs.indexOf(this) * (HEIGHT + MARGIN)
        );
        return new Rectangle(pos, new Vector(width, HEIGHT));
    }

    private isMouseOver(viewport: Viewport): boolean {
        if (!this.dialog.visible) return false;
        const mouse = Pointer.getPosition();
        const rect = this.getRect(viewport);
        return rect.contains(mouse);
    }
}
