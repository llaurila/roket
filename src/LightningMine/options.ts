import type { IColor } from "@/Graphics/Color";

const EPSILON = 0.000001;

export interface ILightningMineOptions {
    range?: number;
    pulseInterval?: number;
    chargeDuration?: number;
    pulseFlashDuration?: number;
    lineWidth?: number;
    idleOpacity?: number;
    chargingOpacity?: number;
    pulseOpacity?: number;
    ambientArcCount?: number;
    ambientArcSpan?: number;
    proximityArcCount?: number;
    proximityArcSpread?: number;
    proximityRange?: number;
    maxProximityTargets?: number;
    arcJitter?: number;
    arcOvershoot?: number;
    idleColor?: IColor;
    chargingColor?: IColor;
    pulseColor?: IColor;
}

export type LightningMineResolvedOptions = Required<ILightningMineOptions>;

const DEFAULT_OPTIONS: LightningMineResolvedOptions = {
    range: 24,
    pulseInterval: 1.35,
    chargeDuration: 0.4,
    pulseFlashDuration: 0.18,
    lineWidth: 0.25,
    idleOpacity: 0.35,
    chargingOpacity: 0.65,
    pulseOpacity: 0.9,
    ambientArcCount: 5,
    ambientArcSpan: 0.5,
    proximityArcCount: 2,
    proximityArcSpread: 0.09,
    proximityRange: 32,
    maxProximityTargets: 3,
    arcJitter: 9,
    arcOvershoot: 6,
    idleColor: { R: 0.45, G: 0.78, B: 1, A: 1 },
    chargingColor: { R: 0.76, G: 0.88, B: 1, A: 1 },
    pulseColor: { R: 1, G: 1, B: 1, A: 1 }
};

export function resolveLightningMineOptions(
    options: ILightningMineOptions
): LightningMineResolvedOptions {
    return {
        ...DEFAULT_OPTIONS,
        ...options,
        range: getPositiveOrDefault(options.range, DEFAULT_OPTIONS.range),
        pulseInterval: getPositiveOrDefault(
            options.pulseInterval,
            DEFAULT_OPTIONS.pulseInterval
        ),
        chargeDuration: getChargeDuration(options, DEFAULT_OPTIONS),
        pulseFlashDuration: getNonNegativeOrDefault(
            options.pulseFlashDuration,
            DEFAULT_OPTIONS.pulseFlashDuration
        ),
        lineWidth: getPositiveOrDefault(options.lineWidth, DEFAULT_OPTIONS.lineWidth),
        idleOpacity: getClampedOrDefault(options.idleOpacity, DEFAULT_OPTIONS.idleOpacity),
        chargingOpacity: getClampedOrDefault(
            options.chargingOpacity,
            DEFAULT_OPTIONS.chargingOpacity
        ),
        pulseOpacity: getClampedOrDefault(options.pulseOpacity, DEFAULT_OPTIONS.pulseOpacity),
        ambientArcCount: getNonNegativeIntOrDefault(
            options.ambientArcCount,
            DEFAULT_OPTIONS.ambientArcCount
        ),
        proximityArcCount: getNonNegativeIntOrDefault(
            options.proximityArcCount,
            DEFAULT_OPTIONS.proximityArcCount
        ),
        maxProximityTargets: getNonNegativeIntOrDefault(
            options.maxProximityTargets,
            DEFAULT_OPTIONS.maxProximityTargets
        ),
        ambientArcSpan: getPositiveOrDefault(
            options.ambientArcSpan,
            DEFAULT_OPTIONS.ambientArcSpan
        ),
        proximityArcSpread: getPositiveOrDefault(
            options.proximityArcSpread,
            DEFAULT_OPTIONS.proximityArcSpread
        ),
        proximityRange: getPositiveOrDefault(
            options.proximityRange,
            DEFAULT_OPTIONS.proximityRange
        ),
        arcJitter: getPositiveOrDefault(options.arcJitter, DEFAULT_OPTIONS.arcJitter),
        arcOvershoot: getNonNegativeOrDefault(options.arcOvershoot, DEFAULT_OPTIONS.arcOvershoot)
    };
}

function getChargeDuration(
    options: ILightningMineOptions,
    defaults: LightningMineResolvedOptions
): number {
    const interval = getPositiveOrDefault(options.pulseInterval, defaults.pulseInterval);
    const charge = getNonNegativeOrDefault(options.chargeDuration, defaults.chargeDuration);

    return Math.min(charge, interval - EPSILON);
}

function getPositiveOrDefault(value: number | undefined, fallback: number): number {
    if (value == undefined || !Number.isFinite(value) || value <= 0) {
        return fallback;
    }

    return value;
}

function getNonNegativeOrDefault(value: number | undefined, fallback: number): number {
    if (value == undefined || !Number.isFinite(value) || value < 0) {
        return fallback;
    }

    return value;
}

function getClampedOrDefault(value: number | undefined, fallback: number): number {
    if (value == undefined || !Number.isFinite(value)) {
        return fallback;
    }

    return Math.max(0, Math.min(1, value));
}

function getNonNegativeIntOrDefault(value: number | undefined, fallback: number): number {
    if (value == undefined || !Number.isFinite(value) || value < 0) {
        return fallback;
    }

    return Math.floor(value);
}
