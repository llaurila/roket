import Vector from "./Vector";
import IUpdatable from "./IUpdatable";
import { Default as Environment } from "./Environment";
import Forces from "./Forces";

class Body implements IUpdatable {
    pos: Vector;
    v: Vector = Vector.Zero;
    rotation: number = 0;
    angularVelocity: number = 0;
    mass: number = 0;

    constructor(position: Vector) {
        this.pos = position;
    }

    getHeading() {
        return Vector.Up.rotate(this.rotation);
    }

    getMass(): number {
        return this.mass;
    }

    getInertia(size: Vector)
    {
        return this.mass * (size.x * size.x + size.y * size.y) / 12;
    }

    update(time: number, delta: number) {
        const forces = this.getForces();

        this.v = this.v.add(
            forces.F.mul(delta).div(this.getMass())
        );

        this.angularVelocity += forces.Torque / this.getMass() * delta;

        this.pos = this.pos.add(
            this.v.mul(delta)
        );
        
        this.rotation += this.angularVelocity * delta;
    }

    getForces(): Forces {
        return new Forces(
            Environment.G.mul(this.getMass()),
            0
        );
    }
}

export default Body;