import { degToRad } from "@/Utils";
import type Vector from "@/Physics/Vector";

const DEFAULT_MAX_THRUST_ANGLE_DEGREES = 35;

export const EPSILON = 1e-6;

export interface NPCAIControllerTarget {
    pos: Vector;
    v?: Vector;
    arriveRadius?: number;
    arriveSpeed?: number;
}

export interface NPCAIControllerCommand {
    leftThrottle: number;
    rightThrottle: number;
}

export interface NPCAIControllerEngineState {
    throttle: number;
    output: number;
    maxThrust: number;
    maxOutputChangeRate: number;
    relativeRotation: number;
}

export interface NPCAIControllerShipState {
    alive: boolean;
    pos: Vector;
    v: Vector;
    acceleration: Vector;
    rotation: number;
    angularVelocity: number;
    heading: Vector;
    mass: number;
    hullIntegrity: number;
    fuel: {
        capacity: number;
        currentAmount: number;
        mass: number;
    };
    engines: {
        left: NPCAIControllerEngineState;
        right: NPCAIControllerEngineState;
    };
}

export interface NPCAIControllerCapabilities {
    mass: number;
    maxForwardAcceleration: number;
    maxBrakingAcceleration: number;
    maxAngularAcceleration: number;
    maxTurnTorque: number;
    engineResponseRate: number;
}

export interface NPCAIControllerGuidanceState {
    relativePosition: Vector;
    relativeVelocity: Vector;
    distance: number;
    closingSpeedLimit: number;
    desiredVelocity: Vector;
    desiredAcceleration: Vector;
    desiredHeading: Vector;
    angleError: number;
    forwardThrottle: number;
    turnCommand: number;
}

export interface NPCAIControllerDebugState extends NPCAIControllerGuidanceState {
    ship: NPCAIControllerShipState;
    target: NPCAIControllerTarget;
    capabilities: NPCAIControllerCapabilities;
}

export interface NPCAIControllerConfig {
    arriveRadius: number;
    arriveSpeed: number;
    maxClosingSpeed: number;
    positionGain: number;
    velocityGain: number;
    stopVelocityGain: number;
    maxPositionAcceleration: number;
    headingGain: number;
    angularDamping: number;
    maxThrustAngle: number;
    alignmentExponent: number;
    turnThrottlePenalty: number;
}

export const DEFAULT_CONFIG: NPCAIControllerConfig = {
    arriveRadius: 8,
    arriveSpeed: 1,
    maxClosingSpeed: 40,
    positionGain: 0.08,
    velocityGain: 1.1,
    stopVelocityGain: 1.6,
    maxPositionAcceleration: 8,
    headingGain: 7,
    angularDamping: 2.5,
    maxThrustAngle: degToRad(DEFAULT_MAX_THRUST_ANGLE_DEGREES),
    alignmentExponent: 2,
    turnThrottlePenalty: 0.5,
};