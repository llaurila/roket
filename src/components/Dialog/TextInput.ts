import { getColorString } from "@/Graphics/Color";
import { Config } from "@/config";
import { makeBgGradient } from "../UIWindow/utils";
import type { Viewport } from "@/Graphics/Viewport";
import type UIDialog from "./index";
import UIInputBase from "./InputBase";
import { hasTouchScreen } from "@/Controls/Device";

const HEIGHT = 30;
const PADDING_X = 10;
const PADDING_Y = 5;
const FONT_SIZE = Config.typography.messageFontSize;
const DEFAULT_MAX_LENGTH = 255;

export default class UITextInput extends UIInputBase {
    public maxLength = DEFAULT_MAX_LENGTH;

    private focused = false;
    private _value: string;
    private mobileInput?: HTMLInputElement;

    public constructor(dialog: UIDialog, value = "") {
        super(dialog);
        this._value = value;
        window.addEventListener("keydown", this.keyHandler);
    }

    public get value() { return this._value; }
    public set value(v: string) {
        this._value = v;
        if (this.mobileInput) this.mobileInput.value = v;
    }

    public focus() { if (!hasTouchScreen()) this.focused = true; }
    public blur() { this.focused = false; this.mobileInput?.blur(); }

    public override hide() {
        this.blur();
        if (this.mobileInput) this.mobileInput.style.display = "none";
    }

    public height(): number { return HEIGHT; }

    public draw(viewport: Viewport) {
        if (hasTouchScreen()) {
            this.drawMobileInput(viewport);
            return;
        }
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
        ctx.fillStyle = getColorString(Config.typography.inputColor);
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
    }

    public update(viewport: Viewport) {
        if (hasTouchScreen() || this.dialog.shouldIgnorePointerInput()) return;
        this.focused = this.isMouseOver(viewport);
    }

    public getHeight(): number { return HEIGHT; }

    private drawMobileInput(viewport: Viewport) {
        const input = this.mobileInput ?? this.createMobileInput();
        const rect = this.getRect(viewport);
        input.style.display = "block";
        input.style.left = `${rect.topLeft.x}px`;
        input.style.top = `${rect.topLeft.y}px`;
        input.style.width = `${rect.size.x}px`;
        input.style.height = `${rect.size.y}px`;
        input.maxLength = this.maxLength;
    }

    private createMobileInput(): HTMLInputElement {
        const input = document.createElement("input");
        input.type = "text";
        input.value = this.value;
        input.autocomplete = "off";
        input.setAttribute("aria-label", "Player name");
        Object.assign(input.style, {
            position: "fixed", boxSizing: "border-box", zIndex: "1",
            color: "white", background: "#151a2a", border: "1px solid white",
            font: `${FONT_SIZE}px ${Config.typography.fontFamily}`, padding: `0 ${PADDING_X}px`
        });
        input.addEventListener("input", () => {
            input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
            this._value = input.value;
        });
        input.addEventListener("keydown", (event) => {
            event.stopPropagation();
            if (event.key === "Enter") this.dispatchEvent(new Event("enter"));
            if (event.key === "Escape") this.dispatchEvent(new Event("escape"));
        });
        document.body.appendChild(input);
        this.mobileInput = input;
        return input;
    }

    private readonly keyHandler = (e: KeyboardEvent) => {
        if (!this.focused) return;
        this.handleKey(e.key);
    };

    private handleKey(key: string) {
        const controlKeys: Record<string, () => void> = {
            "Backspace": () => this._value = this._value.slice(0, -1),
            "Enter": () => this.dispatchEvent(new Event("enter")),
            "Escape": () => this.dispatchEvent(new Event("escape"))
        };

        if (controlKeys[key]) {
            controlKeys[key]();
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
}
