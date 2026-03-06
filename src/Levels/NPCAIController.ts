import type Engine from "@/Engine";
import type Vector from "@/Physics/Vector";
import type Ship from "@/Ship";
import {
    DEFAULT_CONFIG,
    EPSILON,
    type NPCAIControllerCapabilities,
    type NPCAIControllerCommand,
    type NPCAIControllerConfig,
    type NPCAIControllerDebugState,
    type NPCAIControllerEngineState,
    type NPCAIControllerShipState,
    type NPCAIControllerTarget
} from "./NPCAIController.types";
import { buildCommand, buildGuidanceState } from "./NPCAIController.utils";

export type {
    NPCAIControllerCapabilities,
    NPCAIControllerCommand,
    NPCAIControllerConfig,
    NPCAIControllerDebugState,
    NPCAIControllerEngineState,
    NPCAIControllerShipState,
    NPCAIControllerTarget
} from "./NPCAIController.types";

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

        const guidance = buildGuidanceState(this.config, shipState, this.target, capabilities);
        const command = buildCommand(guidance);

        this.applyCommand(command);
        this.lastDebugState = {
            ship: shipState,
            target: this.target,
            capabilities,
            ...guidance
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

    public getCapabilities(
        shipState: NPCAIControllerShipState = this.getShipState()
    ): NPCAIControllerCapabilities {
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
        const rotatedPosition = engine.relativeProps.position.rotate(this.ship.rotation);

        return rotatedPosition.cross(this.getMaxForce(engine));
    }
}

export default NPCAIController;