import type { IColor } from "@/Graphics/Color";
import { Config } from "@/config";

const EPSILON = 0.000001;

export interface ILightningMineOptions {
    range?: number;
    visualRange?: number;
    pulseInterval?: number;
    inRangePulseInterval?: number;
    chargeDuration?: number;
    pulseFlashDuration?: number;
    shieldDrainPerPulse?: number;
    velocityMultiplierPerPulse?: number;
    shieldRechargeLockSeconds?: number;
    lineWidth?: number;
    idleOpacity?: number;
    chargingOpacity?: number;
    pulseOpacity?: number;
    ambientArcCount?: number;
    ambientArcSpan?: number;
    proximityArcCount?: number;
    proximityArcSpread?: number;
    proximitySpreadJitter?: number;
    proximityRange?: number;
    maxProximityTargets?: number;
    proximityArcReach?: number;
    proximityArcReachJitter?: number;
    arcJitter?: number;
    arcOvershoot?: number;
    ambientArcReach?: number;
    idleColor?: IColor;
    chargingColor?: IColor;
    pulseColor?: IColor;
}

export type LightningMineResolvedOptions = Required<ILightningMineOptions>;

export function resolveLightningMineOptions(
    options: ILightningMineOptions
): LightningMineResolvedOptions {
    const defaults = getLightningMineDefaults();

    return {
        ...defaults,
        ...options,
        range: getPositiveOrDefault(options.range, defaults.range),
        visualRange: getPositiveOrDefault(options.visualRange, defaults.visualRange),
        pulseInterval: getPositiveOrDefault(
            options.pulseInterval,
            defaults.pulseInterval
        ),
        inRangePulseInterval: getPositiveOrDefault(
            options.inRangePulseInterval,
            defaults.inRangePulseInterval
        ),
        chargeDuration: getChargeDuration(options, defaults),
        pulseFlashDuration: getNonNegativeOrDefault(
            options.pulseFlashDuration,
            defaults.pulseFlashDuration
        ),
        shieldDrainPerPulse: getNonNegativeOrDefault(
            options.shieldDrainPerPulse,
            defaults.shieldDrainPerPulse
        ),
        velocityMultiplierPerPulse: getClampedOrDefault(
            options.velocityMultiplierPerPulse,
            defaults.velocityMultiplierPerPulse
        ),
        shieldRechargeLockSeconds: getNonNegativeOrDefault(
            options.shieldRechargeLockSeconds,
            defaults.shieldRechargeLockSeconds
        ),
        lineWidth: getPositiveOrDefault(options.lineWidth, defaults.lineWidth),
        idleOpacity: getClampedOrDefault(options.idleOpacity, defaults.idleOpacity),
        chargingOpacity: getClampedOrDefault(
            options.chargingOpacity,
            defaults.chargingOpacity
        ),
        pulseOpacity: getClampedOrDefault(options.pulseOpacity, defaults.pulseOpacity),
        ambientArcCount: getNonNegativeIntOrDefault(
            options.ambientArcCount,
            defaults.ambientArcCount
        ),
        proximityArcCount: getNonNegativeIntOrDefault(
            options.proximityArcCount,
            defaults.proximityArcCount
        ),
        maxProximityTargets: getNonNegativeIntOrDefault(
            options.maxProximityTargets,
            defaults.maxProximityTargets
        ),
        ambientArcSpan: getPositiveOrDefault(
            options.ambientArcSpan,
            defaults.ambientArcSpan
        ),
        proximityArcSpread: getPositiveOrDefault(
            options.proximityArcSpread,
            defaults.proximityArcSpread
        ),
        proximitySpreadJitter: getNonNegativeOrDefault(
            options.proximitySpreadJitter,
            defaults.proximitySpreadJitter
        ),
        proximityRange: getPositiveOrDefault(
            options.proximityRange,
            defaults.proximityRange
        ),
        arcJitter: getPositiveOrDefault(options.arcJitter, defaults.arcJitter),
        arcOvershoot: getNonNegativeOrDefault(options.arcOvershoot, defaults.arcOvershoot),
        proximityArcReach: getNonNegativeOrDefault(
            options.proximityArcReach,
            defaults.proximityArcReach
        ),
        proximityArcReachJitter: getNonNegativeOrDefault(
            options.proximityArcReachJitter,
            defaults.proximityArcReachJitter
        ),
        ambientArcReach: getNonNegativeOrDefault(
            options.ambientArcReach,
            defaults.ambientArcReach
        )
    };
}

function getLightningMineDefaults(): LightningMineResolvedOptions {
    const defaults = Config.lightningMine;

    return {
        range: defaults.range,
        visualRange: defaults.visualRange,
        pulseInterval: defaults.pulseInterval,
        inRangePulseInterval: defaults.inRangePulseInterval,
        chargeDuration: defaults.chargeDuration,
        pulseFlashDuration: defaults.pulseFlashDuration,
        shieldDrainPerPulse: defaults.shieldDrainPerPulse,
        velocityMultiplierPerPulse: defaults.velocityMultiplierPerPulse,
        shieldRechargeLockSeconds: defaults.shieldRechargeLockSeconds,
        lineWidth: defaults.lineWidth,
        idleOpacity: defaults.idleOpacity,
        chargingOpacity: defaults.chargingOpacity,
        pulseOpacity: defaults.pulseOpacity,
        ambientArcCount: defaults.ambientArcCount,
        ambientArcSpan: defaults.ambientArcSpan,
        proximityArcCount: defaults.proximityArcCount,
        proximityArcSpread: defaults.proximityArcSpread,
        proximitySpreadJitter: defaults.proximitySpreadJitter,
        proximityRange: defaults.proximityRange,
        maxProximityTargets: defaults.maxProximityTargets,
        proximityArcReach: defaults.proximityArcReach,
        proximityArcReachJitter: defaults.proximityArcReachJitter,
        arcJitter: defaults.arcJitter,
        arcOvershoot: defaults.arcOvershoot,
        ambientArcReach: defaults.ambientArcReach,
        idleColor: defaults.idleColor,
        chargingColor: defaults.chargingColor,
        pulseColor: defaults.pulseColor
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
