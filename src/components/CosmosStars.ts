import { random } from "../Utils";

const COLOR_CHANNEL_MAX = 255;
const DEFAULT_TINT_WEIGHT = 1;
const DEFAULT_TINT_MIN = 220;
const FULL_TWINKLE_CYCLE = Math.PI * 2;

export enum StarType {
    Normal = "normal",
    Rare = "rare"
}

export interface IStarColor {
    r: number;
    g: number;
    b: number;
}

export interface IStarTint {
    weight: number;
    rMin: number;
    gMin: number;
    bMin: number;
}

export interface IStarTwinkle {
    amount: number;
    speedHz: number;
    phase: number;
}

export interface ICosmosTwinkleConfig {
    amountMin: number;
    amountMax: number;
    speedMinHz: number;
    speedMaxHz: number;
    rareAmountMultiplier: number;
}

const DEFAULT_STAR_TINT: IStarTint = {
    weight: DEFAULT_TINT_WEIGHT,
    rMin: DEFAULT_TINT_MIN,
    gMin: DEFAULT_TINT_MIN,
    bMin: DEFAULT_TINT_MIN
};

export function generateStarType(rareStarChance: number): StarType {
    return Math.random() < rareStarChance
        ? StarType.Rare
        : StarType.Normal;
}

export function generateStarColor(tints: IStarTint[]): IStarColor {
    const tint = pickStarTint(tints);

    return {
        r: randomBrightChannel(tint.rMin),
        g: randomBrightChannel(tint.gMin),
        b: randomBrightChannel(tint.bMin)
    };
}

export function generateStarTwinkle(
    type: StarType,
    twinkleConfig: ICosmosTwinkleConfig
): IStarTwinkle {
    const rareAmountMultiplier = type === StarType.Rare
        ? twinkleConfig.rareAmountMultiplier
        : 1;

    return {
        amount: random(twinkleConfig.amountMin, twinkleConfig.amountMax) * rareAmountMultiplier,
        speedHz: random(twinkleConfig.speedMinHz, twinkleConfig.speedMaxHz),
        phase: random(0, FULL_TWINKLE_CYCLE)
    };
}

export function applyTwinkle(twinkle: IStarTwinkle, alpha: number, time: number): number {
    const pulse = Math.sin(time * FULL_TWINKLE_CYCLE * twinkle.speedHz + twinkle.phase);
    const twinkleMultiplier = 1 + pulse * twinkle.amount;
    return clampAlpha(alpha * twinkleMultiplier);
}

export function colorToRgba(color: IStarColor, alpha: number): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${clampAlpha(alpha)})`;
}

function pickStarTint(tints: IStarTint[]): IStarTint {
    const starTints = tints.length > 0 ? tints : [DEFAULT_STAR_TINT];
    const totalWeight = starTints.reduce((total, tint) => total + Math.max(0, tint.weight), 0);
    let roll = Math.random() * Math.max(totalWeight, DEFAULT_TINT_WEIGHT);

    for (const tint of starTints) {
        roll -= Math.max(0, tint.weight);
        if (roll <= 0) {
            return tint;
        }
    }

    return starTints[starTints.length - 1];
}

function randomBrightChannel(min: number): number {
    return Math.round(random(min, COLOR_CHANNEL_MAX));
}

function clampAlpha(value: number): number {
    return Math.max(0, Math.min(1, value));
}
