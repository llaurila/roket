import type { Viewport } from "@/Graphics/Viewport";
import Vector from "@/Physics/Vector";
import {
    AMBIENT_PHASE_OFFSET,
    JITTER_PHASE_OFFSET,
    JITTER_TIME_SCALE
} from "./constants";

const ARC_NOISE_SEED_SCALE = 19.31;
const ARC_NOISE_SEGMENT_SCALE = 11.73;
const ARC_NOISE_TIME_SCALE = 3.9;
const ARC_NOISE_BASE_MULTIPLIER = 0.7;
const ARC_NOISE_INTENSITY_MULTIPLIER = 0.9;
const BRANCH_MAX_ANGLE_FACTOR = 0.9;

const FORWARD_NOISE_SEED_SCALE = 23.17;
const FORWARD_NOISE_SEGMENT_SCALE = 7.13;
const FORWARD_NOISE_TIME_SCALE = 2.3;
const FORWARD_NOISE_MULTIPLIER = 0.35;

const SPREAD_JITTER_BASE = 0.6;
const SPREAD_JITTER_PROXIMITY_MULTIPLIER = 1.5;
const SPREAD_JITTER_SEED_SCALE = 5.17;
const SPREAD_JITTER_PHASE_MULTIPLIER = 7;
const SPREAD_JITTER_TIME_SCALE = 2.1;

const OVERSHOOT_JITTER_TIME_SCALE = 0.75;

const END_JITTER_BASE = 0.4;
const END_JITTER_SEED_SCALE = 13.7;
const END_JITTER_TIME_SCALE = 1.9;

const NOISE_HASH_MULTIPLIER = 43758.5453123;

const BRANCH_CHANCE_SEED_SCALE = 3.77;
const BRANCH_CHANCE_SEGMENT_SCALE = 9.21;
const BRANCH_CHANCE_TIME_SCALE = 2.7;

const BRANCH_LENGTH_SEED_SCALE = 17.31;
const BRANCH_LENGTH_SEGMENT_SCALE = 4.39;
const BRANCH_LENGTH_TIME_SCALE = 1.5;
const BRANCH_LENGTH_DISTANCE_MULTIPLIER = 0.14;
const BRANCH_LENGTH_MIN_FACTOR = 0.4;
const BRANCH_LENGTH_RANGE_FACTOR = 1.1;
const BRANCH_INTENSITY_MIN = 0.25;

const BRANCH_ANGLE_SEED_SCALE = 27.41;
const BRANCH_ANGLE_SEGMENT_SCALE = 8.53;
const BRANCH_ANGLE_TIME_SCALE = 3.1;
const BRANCH_MAX_ANGLE = Math.PI * BRANCH_MAX_ANGLE_FACTOR;

export function getArcOffset(
    seed: number,
    segment: number,
    jitterScale: number,
    intensity: number,
    time: number
): number {
    const phase = seed * ARC_NOISE_SEED_SCALE +
        segment * JITTER_PHASE_OFFSET * ARC_NOISE_SEGMENT_SCALE +
        time * JITTER_TIME_SCALE * ARC_NOISE_TIME_SCALE;

    return getSignedNoise(phase) * jitterScale * (
        ARC_NOISE_BASE_MULTIPLIER + intensity * ARC_NOISE_INTENSITY_MULTIPLIER
    );
}

export function getArcForwardOffset(
    seed: number,
    segment: number,
    jitterScale: number,
    time: number
): number {
    const phase = seed * FORWARD_NOISE_SEED_SCALE +
        segment * JITTER_PHASE_OFFSET * FORWARD_NOISE_SEGMENT_SCALE +
        time * JITTER_TIME_SCALE * FORWARD_NOISE_TIME_SCALE;

    return getSignedNoise(phase) * jitterScale * FORWARD_NOISE_MULTIPLIER;
}

export function getProximitySpreadJitter(
    index: number,
    proximity: number,
    seed: number,
    proximitySpreadJitter: number,
    time: number
): number {
    const jitterScale = proximitySpreadJitter * (
        SPREAD_JITTER_BASE + proximity * SPREAD_JITTER_PROXIMITY_MULTIPLIER
    );
    const phase = seed * SPREAD_JITTER_SEED_SCALE +
        index * AMBIENT_PHASE_OFFSET * SPREAD_JITTER_PHASE_MULTIPLIER +
        time * JITTER_TIME_SCALE * SPREAD_JITTER_TIME_SCALE;

    return getSignedNoise(phase) * jitterScale;
}

export function getProximityOvershoot(
    viewport: Viewport,
    proximity: number,
    arcOvershoot: number,
    proximityArcReach: number,
    proximityArcReachJitter: number,
    time: number
): number {
    const base = arcOvershoot + proximityArcReach;
    const jitter = Math.sin(time * JITTER_TIME_SCALE * OVERSHOOT_JITTER_TIME_SCALE) *
        proximityArcReachJitter * proximity;

    return viewport.toScreenScale(Math.max(0, base + jitter));
}

export function getProximityEndJitter(
    viewport: Viewport,
    seed: number,
    proximity: number,
    direction: Vector,
    proximityArcReachJitter: number,
    time: number
): Vector {
    const normal = new Vector(-direction.y, direction.x);
    const jitterMagnitude = viewport.toScreenScale(
        proximityArcReachJitter * (END_JITTER_BASE + proximity)
    );
    const phase = seed * END_JITTER_SEED_SCALE +
        time * JITTER_TIME_SCALE * END_JITTER_TIME_SCALE;
    const jitter = getSignedNoise(phase) * jitterMagnitude;

    return normal.mul(jitter);
}

export function shouldSpawnLightningBranch(
    seed: number,
    segment: number,
    time: number,
    chance: number
): boolean {
    const clampedChance = Math.max(0, Math.min(1, chance));
    if (clampedChance <= 0) {
        return false;
    }

    const phase = seed * BRANCH_CHANCE_SEED_SCALE +
        segment * BRANCH_CHANCE_SEGMENT_SCALE +
        time * JITTER_TIME_SCALE * BRANCH_CHANCE_TIME_SCALE;

    return getUnitNoise(phase) < clampedChance;
}

export function getLightningBranchOffset(
    tangent: Vector,
    distance: number,
    intensity: number,
    seed: number,
    segment: number,
    time: number
): Vector {
    const lengthPhase = seed * BRANCH_LENGTH_SEED_SCALE +
        segment * BRANCH_LENGTH_SEGMENT_SCALE +
        time * JITTER_TIME_SCALE * BRANCH_LENGTH_TIME_SCALE;

    const lengthScale = BRANCH_LENGTH_MIN_FACTOR +
        getUnitNoise(lengthPhase) * BRANCH_LENGTH_RANGE_FACTOR;
    const intensityScale = Math.max(BRANCH_INTENSITY_MIN, intensity);
    const length = distance * BRANCH_LENGTH_DISTANCE_MULTIPLIER * lengthScale * intensityScale;

    const anglePhase = seed * BRANCH_ANGLE_SEED_SCALE +
        segment * BRANCH_ANGLE_SEGMENT_SCALE +
        time * JITTER_TIME_SCALE * BRANCH_ANGLE_TIME_SCALE;
    const angle = getSignedNoise(anglePhase) * BRANCH_MAX_ANGLE;

    return tangent.rotate(angle).mul(length);
}

function getSignedNoise(phase: number): number {
    const noise = Math.sin(phase) * NOISE_HASH_MULTIPLIER;
    return (noise - Math.floor(noise)) * 2 - 1;
}

function getUnitNoise(phase: number): number {
    return (getSignedNoise(phase) + 1) / 2;
}
