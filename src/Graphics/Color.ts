import { interpolate } from "../Utils";

interface IColor {
    R: number,
    G: number,
    B: number,
    A: number
}

interface IColorStep {
    Color: IColor;
    Pos: number;
}

function getInterpolatedColor(steps: IColorStep[], pos: number): IColor {
    for (let i = 1; i < steps.length; i++) {
        const step = steps[i];
        if (pos < step.Pos) {
            const
                c1 = steps[i-1].Color,
                c2 = step.Color;

            const scale = step.Pos - steps[i-1].Pos;
            const rp = (pos - steps[i-1].Pos) / scale;

            return {
                R: interpolate(c1.R, c2.R, rp),
                G: interpolate(c1.G, c2.G, rp),
                B: interpolate(c1.B, c2.B, rp),
                A: interpolate(c1.A, c2.A, rp)
            }
        }
    }

    return steps[steps.length - 1].Color;
}

export {
    IColor,
    IColorStep,
    getInterpolatedColor
}