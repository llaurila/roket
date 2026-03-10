import type { IConfig } from "./types";

export const COSMOS_CONFIG: IConfig["cosmos"] = {
    starDensity: 400,
    starBrightnessMin: 0.25,
    starBrightnessMax: 1.00,
    starTints: [
        {
            weight: 70,
            rMin: 230,
            gMin: 230,
            bMin: 230
        },
        {
            weight: 10,
            rMin: 238,
            gMin: 190,
            bMin: 140
        },
        {
            weight: 8,
            rMin: 150,
            gMin: 220,
            bMin: 240
        },
        {
            weight: 7,
            rMin: 235,
            gMin: 150,
            bMin: 225
        },
        {
            weight: 5,
            rMin: 130,
            gMin: 160,
            bMin: 245
        }
    ],
    twinkle: {
        amountMin: 0.02,
        amountMax: 0.09,
        speedMinHz: 0.2,
        speedMaxHz: 1.1,
        rareAmountMultiplier: 1.35
    }
};
