import type Ship from "../../Ship";
import LevelConfig from "./config";

class NPCAI {
    private player: Ship;
    private me: Ship;

    public constructor(ship: Ship, enemy: Ship) {
        this.player = ship;
        this.me = enemy;
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
        this.me.engineLeft.setThrottle(0);
        this.me.engineRight.setThrottle(0);
    }

    private accelerateTowardsTarget(turn: number) {
        this.resetThrottle();

        if (Math.abs(turn) < LevelConfig.CORRECT_HEADING_TOLERANCE) {
            this.me.engineLeft.setThrottle(1);
            this.me.engineRight.setThrottle(1);
        }
        else if (turn >= 0) {
            this.me.engineRight.setThrottle(turn);
        } else {
            this.me.engineLeft.setThrottle(-turn);
        }
    }

    private handleSpin() {
        this.resetThrottle();

        if (this.me.angularVelocity >= 0) {
            this.me.engineLeft.setThrottle(
                Math.min(this.me.angularVelocity, 1)
            );
        } else {
            this.me.engineRight.setThrottle(
                Math.min(-this.me.angularVelocity, 1)
            );
        }
    }

    private isSpinning(): boolean {
        const SPIN_THRESHOLD = 0.5;
        return Math.abs(this.me.angularVelocity) > SPIN_THRESHOLD;
    }

    private getTurnTowardsTarget(): number {
        const target = this.getVectorToTarget();
        const headingToTarget = target.sub(this.me.pos).normalize();
        return this.me.getHeading().cross(headingToTarget);
    }

    private getVectorToTarget = () => this.player.pos.add(this.player.v.neg());
}

export default NPCAI;
