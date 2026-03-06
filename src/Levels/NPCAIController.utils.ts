import type Vector from "@/Physics/Vector";
import type {
    NPCAIControllerCapabilities,
    NPCAIControllerCommand,
    NPCAIControllerConfig,
    NPCAIControllerGuidanceState,
    NPCAIControllerShipState,
    NPCAIControllerTarget
} from "./NPCAIController.types";
import { EPSILON } from "./NPCAIController.types";

export function buildGuidanceState(
    config: NPCAIControllerConfig,
    shipState: NPCAIControllerShipState,
    target: NPCAIControllerTarget,
    capabilities: NPCAIControllerCapabilities
): NPCAIControllerGuidanceState {
    const arriveRadius = target.arriveRadius ?? 0;
    const targetVelocity = target.v?.clone() ?? shipState.v.mul(0);
    const relativePosition = target.pos.sub(shipState.pos);
    const relativeVelocity = targetVelocity.sub(shipState.v);
    const distance = relativePosition.length();
    const directionToTarget = normalizeOrFallback(relativePosition, shipState.heading);
    const closingSpeedLimit = getClosingSpeedLimit(config, capabilities, distance, arriveRadius);
    const desiredVelocity = getDesiredVelocity(
        targetVelocity,
        directionToTarget,
        distance,
        arriveRadius,
        closingSpeedLimit
    );
    const velocityError = desiredVelocity.sub(shipState.v);
    const desiredAcceleration = getDesiredAcceleration(
        config,
        targetVelocity,
        directionToTarget,
        velocityError,
        shipState,
        distance,
        arriveRadius
    );

    const desiredHeading = getDesiredHeading(
        desiredAcceleration,
        velocityError,
        relativePosition,
        shipState.heading
    );
    const angleError = getSignedAngle(shipState.heading, desiredHeading);
    const desiredAngularAcceleration =
        angleError * config.headingGain - shipState.angularVelocity * config.angularDamping;
    const turnCommand = clamp(
        desiredAngularAcceleration / capabilities.maxAngularAcceleration,
        -1,
        1
    );
    const alignment = getAlignment(config, angleError);
    const desiredForwardAcceleration = Math.max(0, desiredAcceleration.dot(shipState.heading));
    const forwardThrottle = clamp(
        desiredForwardAcceleration / capabilities.maxForwardAcceleration,
        0,
        1
    ) * alignment * (1 - Math.abs(turnCommand) * config.turnThrottlePenalty);

    return {
        relativePosition,
        relativeVelocity,
        distance,
        closingSpeedLimit,
        desiredVelocity,
        desiredAcceleration,
        desiredHeading,
        angleError,
        forwardThrottle,
        turnCommand
    };
}

export function buildCommand(guidance: NPCAIControllerGuidanceState): NPCAIControllerCommand {
    return {
        leftThrottle: clamp(guidance.forwardThrottle - guidance.turnCommand, 0, 1),
        rightThrottle: clamp(guidance.forwardThrottle + guidance.turnCommand, 0, 1)
    };
}

function getAlignment(config: NPCAIControllerConfig, angleError: number): number {
    if (Math.abs(angleError) >= config.maxThrustAngle) {
        return 0;
    }

    return Math.pow(Math.max(0, Math.cos(angleError)), config.alignmentExponent);
}

function getDesiredHeading(
    desiredAcceleration: Vector,
    velocityError: Vector,
    relativePosition: Vector,
    fallback: Vector
): Vector {
    if (desiredAcceleration.length() > EPSILON) {
        return desiredAcceleration.normalize();
    }

    if (velocityError.length() > EPSILON) {
        return velocityError.normalize();
    }

    if (relativePosition.length() > EPSILON) {
        return relativePosition.normalize();
    }

    return fallback.clone();
}

function normalizeOrFallback(v: Vector, fallback: Vector): Vector {
    return v.length() > EPSILON
        ? v.normalize()
        : fallback.clone();
}

function getSignedAngle(from: Vector, to: Vector): number {
    return Math.atan2(from.cross(to), from.dot(to));
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function getClosingSpeedLimit(
    config: NPCAIControllerConfig,
    capabilities: NPCAIControllerCapabilities,
    distance: number,
    arriveRadius: number
): number {
    const brakingDistance = Math.max(distance - arriveRadius, 0);

    return Math.min(
        config.maxClosingSpeed,
        Math.sqrt(2 * capabilities.maxBrakingAcceleration * brakingDistance)
    );
}

function getDesiredVelocity(
    targetVelocity: Vector,
    directionToTarget: Vector,
    distance: number,
    arriveRadius: number,
    closingSpeedLimit: number
): Vector {
    return distance <= arriveRadius
        ? targetVelocity
        : targetVelocity.add(directionToTarget.mul(closingSpeedLimit));
}

function getDesiredAcceleration(
    config: NPCAIControllerConfig,
    targetVelocity: Vector,
    directionToTarget: Vector,
    velocityError: Vector,
    shipState: NPCAIControllerShipState,
    distance: number,
    arriveRadius: number
): Vector {
    if (distance <= arriveRadius) {
        return targetVelocity.sub(shipState.v).mul(config.stopVelocityGain);
    }

    const positionAcceleration = directionToTarget.mul(
        Math.min(distance * config.positionGain, config.maxPositionAcceleration)
    );

    return velocityError.mul(config.velocityGain).add(positionAcceleration);
}