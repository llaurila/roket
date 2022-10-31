import { interpolate } from "../Utils";

export const COLOR_CHANNEL_MAX = 255;

export interface IColor {
    R: number,
    G: number,
    B: number,
    A: number
}

export interface IColorStep {
    Color: IColor;
    Pos: number;
}

export function getInterpolatedColor(steps: IColorStep[], pos: number): IColor {
    for (let i = 1; i < steps.length; i++) {
        const step = steps[i];
        if (pos < step.Pos) {
            const
                c1 = steps[i - 1].Color,
                c2 = step.Color;

            const scale = step.Pos - steps[i - 1].Pos;
            const rp = (pos - steps[i - 1].Pos) / scale;

            return {
                R: interpolate(c1.R, c2.R, rp),
                G: interpolate(c1.G, c2.G, rp),
                B: interpolate(c1.B, c2.B, rp),
                A: interpolate(c1.A, c2.A, rp)
            };
        }
    }

    return steps[steps.length - 1].Color;
}

export function getGray(luminance: number, alpha = 1): IColor {
    return {
        R: luminance,
        G: luminance,
        B: luminance,
        A: alpha
    };
}

export function getGrayHex(luminance: number, alpha = 1): string {
    return getColorString(
        getGray(luminance, alpha)
    );
}

export function getColorStringFromRGBA(r: number, g: number, b: number, alpha = 1): string {
    return `rgba(${getCC(r)}, ${getCC(g)}, ${getCC(b)}, ${alpha})`;
}

export function getColorString(color: IColor): string {
    return `rgba(${getCC(color.R)}, ${getCC(color.G)}, ${getCC(color.B)}, ${color.A})`;
}

function getCC(c: number): number {
    return Math.floor(c * COLOR_CHANNEL_MAX);
}
