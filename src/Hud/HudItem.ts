import { Config } from "../config";
import { IColor } from "../Graphics/Color";

export type GetColor = () => IColor|null;

export const DefaultColor: GetColor = () => Config.typography.defaultColor;

export const HudItemDisabled: GetColor = () => null;

export class HudItem {
    getText: () => string;
    getColor: GetColor;

    constructor(getText: () => string, getColor: GetColor = DefaultColor) {
        this.getText = getText;
        this.getColor = getColor;
    }
}
