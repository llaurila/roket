import { Config } from "@/config";
import type { IColor } from "@/Graphics/Color";

export type GetColor = () => IColor|null;

export const DefaultColor: GetColor = () => Config.typography.defaultColor;

export const HudItemDisabled: GetColor = () => null;

export class HudItem {
    public getText: () => string;
    public getColor: GetColor;

    public constructor(getText: () => string, getColor: GetColor = DefaultColor) {
        this.getText = getText;
        this.getColor = getColor;
    }
}
