import Vector from "@/Physics/Vector";
import { IShip } from "@/Ship/types";

//const DefaultMaxSpeed = 10;

class AutoPilot {
    private target = Vector.Zero;
    //private maxSpeed: number = DefaultMaxSpeed;

    constructor(private ship: IShip) {
    }

    public control(): void {
        // This class is a placeholder for the autopilot logic.
        // It can be extended or modified to implement specific autopilot behaviors.
    }

    public setTarget(pos: Vector): void {
        this.target = pos;
    }

    public getVectorToTarget(): Vector {
        return this.target.sub(this.ship.pos);
    }

    public getAngleToTarget(): number {
        const toTarget = this.getVectorToTarget().normalize();
        return this.ship.getHeading().cross(toTarget);
    }

    public getSpeedToTarget(): number {
        return this.ship.v.dot(this.getVectorToTarget().normalize());
    }
}

export default AutoPilot;
