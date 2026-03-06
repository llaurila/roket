import type Engine from "@/Engine";
import type Vector from "@/Physics/Vector";
import { degToRad } from "@/Utils";
import Ship from "@/Ship";

const EPSILON = 1e-6;

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

export interface NPCAIControllerDebugState {
    ship: NPCAIControllerShipState;
    target: NPCAIControllerTarget;
    capabilities: NPCAIControllerCapabilities;
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

const DEFAULT_CONFIG: NPCAIControllerConfig = {
    arriveRadius: 8,
    arriveSpeed: 1,
    maxClosingSpeed: 40,
    positionGain: 0.08,
    velocityGain: 1.1,
    stopVelocityGain: 1.6,
    maxPositionAcceleration: 8,
    headingGain: 7,
    angularDamping: 2.5,
    maxThrustAngle: degToRad(35),
    alignmentExponent: 2,
    turnThrottlePenalty: 0.5,
};

class NPCAIController {
    private target?: NPCAIControllerTarget;
    private lastCommand: NPCAIControllerCommand = {
        leftThrottle: 0,
        rightThrottle: 0
    };
    private lastDebugState?: NPCAIControllerDebugState;

    public constructor(
        public readonly ship: Ship,
        private readonly config: NPCAIControllerConfig = DEFAULT_CONFIG
    ) {
    }

    public setTarget(target: NPCAIControllerTarget): void {
        this.target = {
            ...target,
            pos: target.pos.clone(),
            v: target.v?.clone(),
            arriveRadius: target.arriveRadius ?? this.config.arriveRadius,
            arriveSpeed: target.arriveSpeed ?? this.config.arriveSpeed
        };
    }

    public clearTarget(): void {
        this.target = undefined;
        this.stop();
        this.lastDebugState = undefined;
    }

    public control(): NPCAIControllerCommand {
        if (!this.target || !this.ship.alive) {
            this.lastDebugState = undefined;
            return this.stop();
        }

        const shipState = this.getShipState();
        const capabilities = this.getCapabilities(shipState);

        if (capabilities.mass <= EPSILON) {
            this.lastDebugState = undefined;
            return this.stop();
        }

        const targetVelocity = this.target.v?.clone() ?? shipState.v.mul(0);
        const relativePosition = this.target.pos.sub(shipState.pos);
        const relativeVelocity = targetVelocity.sub(shipState.v);
        const distance = relativePosition.length();
        const directionToTarget = normalizeOrFallback(relativePosition, shipState.heading);
        const brakingDistance = Math.max(distance - (this.target.arriveRadius ?? 0), 0);
        const closingSpeedLimit = Math.min(
            this.config.maxClosingSpeed,
            Math.sqrt(2 * capabilities.maxBrakingAcceleration * brakingDistance)
        );

        const desiredVelocity = distance <= (this.target.arriveRadius ?? 0)
            ? targetVelocity
            : targetVelocity.add(directionToTarget.mul(closingSpeedLimit));

        const velocityError = desiredVelocity.sub(shipState.v);
        const positionAcceleration = directionToTarget.mul(
            Math.min(distance * this.config.positionGain, this.config.maxPositionAcceleration)
        );

        const desiredAcceleration = distance <= (this.target.arriveRadius ?? 0)
            ? targetVelocity.sub(shipState.v).mul(this.config.stopVelocityGain)
            : velocityError.mul(this.config.velocityGain).add(positionAcceleration);

        const desiredHeading = getDesiredHeading(
            desiredAcceleration,
            velocityError,
            relativePosition,
            shipState.heading
        );

        const angleError = getSignedAngle(shipState.heading, desiredHeading);
        const desiredAngularAcceleration =
            angleError * this.config.headingGain -
            shipState.angularVelocity * this.config.angularDamping;
        const turnCommand = clamp(
            desiredAngularAcceleration / capabilities.maxAngularAcceleration,
            -1,
            1
        );

        const angleMagnitude = Math.abs(angleError);
        const alignment = angleMagnitude >= this.config.maxThrustAngle
            ? 0
            : Math.pow(Math.max(0, Math.cos(angleError)), this.config.alignmentExponent);
        const desiredForwardAcceleration = Math.max(0, desiredAcceleration.dot(shipState.heading));
        const forwardThrottle = clamp(
            desiredForwardAcceleration / capabilities.maxForwardAcceleration,
            0,
            1
        ) * alignment * (1 - Math.abs(turnCommand) * this.config.turnThrottlePenalty);

        const command = {
            leftThrottle: clamp(forwardThrottle - turnCommand, 0, 1),
            rightThrottle: clamp(forwardThrottle + turnCommand, 0, 1)
        };

        this.applyCommand(command);
        this.lastDebugState = {
            ship: shipState,
            target: this.target,
            capabilities,
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

        return command;
    }

    public stop(): NPCAIControllerCommand {
        const command = {
            leftThrottle: 0,
            rightThrottle: 0
        };

        this.applyCommand(command);
        return command;
    }

    public getShipState(): NPCAIControllerShipState {
        return {
            alive: this.ship.alive,
            pos: this.ship.pos.clone(),
            v: this.ship.v.clone(),
            acceleration: this.ship.getAcceleration().clone(),
            rotation: this.ship.rotation,
            angularVelocity: this.ship.angularVelocity,
            heading: this.ship.getHeading().clone(),
            mass: this.ship.getMass(),
            hullIntegrity: this.ship.hullIntegrity,
            fuel: {
                capacity: this.ship.fuelTank.capacity,
                currentAmount: this.ship.fuelTank.currentAmount,
                mass: this.ship.fuelTank.getMass()
            },
            engines: {
                left: this.getEngineState(this.ship.engineLeft),
                right: this.getEngineState(this.ship.engineRight)
            }
        };
    }

    public getCapabilities(shipState: NPCAIControllerShipState = this.getShipState()): NPCAIControllerCapabilities {
        const mass = shipState.mass;
        const leftForce = this.getMaxForce(this.ship.engineLeft);
        const rightForce = this.getMaxForce(this.ship.engineRight);
        const forwardForce = Math.max(0, leftForce.add(rightForce).dot(shipState.heading));
        const leftTorque = Math.abs(this.getMaxTorque(this.ship.engineLeft));
        const rightTorque = Math.abs(this.getMaxTorque(this.ship.engineRight));
        const maxTurnTorque = Math.max(leftTorque, rightTorque);
        const safeMass = Math.max(mass, EPSILON);

        return {
            mass,
            maxForwardAcceleration: forwardForce / safeMass,
            maxBrakingAcceleration: forwardForce / safeMass,
            maxAngularAcceleration: maxTurnTorque / safeMass,
            maxTurnTorque,
            engineResponseRate: Math.min(
                this.ship.engineLeft.config.maxOutputChangeRate,
                this.ship.engineRight.config.maxOutputChangeRate
            ) / safeMass
        };
    }

    public getTarget(): NPCAIControllerTarget | undefined {
        return this.target;
    }

    public getLastCommand(): NPCAIControllerCommand {
        return this.lastCommand;
    }

    public getLastDebugState(): NPCAIControllerDebugState | undefined {
        return this.lastDebugState;
    }

    private applyCommand(command: NPCAIControllerCommand): void {
        this.ship.engineLeft.setChoke(1);
        this.ship.engineRight.setChoke(1);
        this.ship.engineLeft.setThrottle(command.leftThrottle);
        this.ship.engineRight.setThrottle(command.rightThrottle);
        this.lastCommand = command;
    }

    private getEngineState(engine: Engine): NPCAIControllerEngineState {
        return {
            throttle: engine.getThrottle(),
            output: engine.output,
            maxThrust: engine.config.maxThrust,
            maxOutputChangeRate: engine.config.maxOutputChangeRate,
            relativeRotation: engine.relativeProps.rotation
        };
    }

    private getMaxForce(engine: Engine): Vector {
        return engine.getHeading().mul(engine.config.maxThrust);
    }

    private getMaxTorque(engine: Engine): number {
        return engine.relativeProps.position.rotate(this.ship.rotation).cross(this.getMaxForce(engine));
    }
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

export default NPCAIController;