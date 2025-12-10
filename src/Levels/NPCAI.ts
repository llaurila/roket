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

    /* eslint-disable-next-line complexity */
    private accelerateTowardsTarget(turn: number) {
        if (this.goingToTarget()) {
            return;
        }

        this.resetThrottle();

        const speedRelativeToTarget = this.ship.v.dot(
            this.getAimVector().sub(this.ship.pos).normalize()
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
        const SPIN_THRESHOLD = .7;
        return Math.abs(this.ship.angularVelocity) > SPIN_THRESHOLD;
    }

    private goingToTarget(): boolean {
        const SPEED_LIMIT = 10;
        const target = this.getTarget();
        const toTarget = target.pos.sub(this.ship.pos).normalize();
        const speed = this.ship.v.normalize();
        return Math.abs(speed.cross(toTarget)) < this.cfg.headingTolerance / 2 &&
            this.ship.v.length() > SPEED_LIMIT;
    }

    private getTurnTowardsTarget(): number {
        return this.getAngleTowardsTarget() * 2;
    }

    private getAngleTowardsTarget(): number {
        const target = this.getAimVector();
        const toTarget = target.sub(this.ship.pos).normalize();
        return this.ship.getHeading().cross(toTarget);
    }

    private getAimVector(): Vector {
        const V_PREDICTION = 0.4;
        const target = this.getTarget();
        const targetPos = target.pos.add(target.v.mul(V_PREDICTION));
        return targetPos.sub(this.ship.pos);
    };
}

export default NPCAI;
