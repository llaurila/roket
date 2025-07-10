import type Vector from "@/Physics/Vector";
import type Ship from "../Ship";

interface AIConfig {
    headingTolerance: number;
    maxDistanceFromPlayer: number;
    maxSpeed: number;
}

interface Target {
    pos: Vector;
    v: Vector;
}

type GetTarget = () => Target;

class NPCAI {
    private ship: Ship;
    private cfg: AIConfig;
    private getTarget: GetTarget;

    public constructor(ship: Ship, cfg: AIConfig, getTarget: GetTarget) {
        this.ship = ship;
        this.cfg = cfg;
        this.getTarget = getTarget;
    }

    public think(): void {
        if (this.isSpinning()) {
            this.handleSpin();
        }
        else {
            const turnAngle = this.getTurnTowardsTarget();
            this.accelerateTowardsTarget(turnAngle);
        }
    }

    private resetThrottle() {
        this.ship.engineLeft.setThrottle(0);
        this.ship.engineRight.setThrottle(0);
    }

    private accelerateTowardsTarget(turn: number) {
        this.resetThrottle();

        const speedRelativeToTarget = this.ship.v.dot(
            this.getVectorToTarget().sub(this.ship.pos).normalize()
        );

        const canThrustForward = speedRelativeToTarget < this.cfg.maxSpeed;

        if (Math.abs(turn) < this.cfg.headingTolerance) {
            if (canThrustForward) {
                this.ship.engineLeft.setThrottle(1);
                this.ship.engineRight.setThrottle(1);
            }
        }
        else if (turn >= 0) {
            this.ship.engineRight.setThrottle(Math.min(turn, 1));
        } else {
            this.ship.engineLeft.setThrottle(Math.min(-turn, 1));
        }
    }

    private handleSpin() {
        this.resetThrottle();

        if (this.ship.angularVelocity >= 0) {
            this.ship.engineLeft.setThrottle(
                Math.min(this.ship.angularVelocity, 1)
            );
        } else {
            this.ship.engineRight.setThrottle(
                Math.min(-this.ship.angularVelocity, 1)
            );
        }
    }

    private isSpinning(): boolean {
        const SPIN_THRESHOLD = .8;
        return Math.abs(this.ship.angularVelocity) > SPIN_THRESHOLD;
    }

    private getTurnTowardsTarget(): number {
        const target = this.getVectorToTarget();
        const headingToTarget = target.sub(this.ship.pos).normalize();
        return this.ship.getHeading().cross(headingToTarget);
    }

    private getVectorToTarget(): Vector {
        const target = this.getTarget();

        /*const distance = this.ship.pos.distanceTo(target.pos);
        if (distance > this.cfg.maxDistanceFromPlayer) {
            return target.pos;
        }*/

        return target.pos.add(target.v.neg());
    };
}

export default NPCAI;
