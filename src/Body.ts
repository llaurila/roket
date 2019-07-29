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
    centerOfMass: Vector = Vector.Zero;

    protected _alive: boolean = true;
    private forces: Forces = Forces.Zero;

    constructor(position: Vector) {
        this.pos = position;
    }

    get alive(): boolean {
        return this._alive;
    }

    set alive(value: boolean) {
        this._alive = value;
    }

    getHeading() {
        return Vector.Up.rotate(this.rotation);
    }

    getMass(): number {
        return this.mass;
    }

    applyForce(F: Vector, point: Vector): void {
        let Torque = (point.sub(this.centerOfMass)).cross(F);
        this.forces = this.forces.add(
            new Forces(F, Torque)
        );
    }

    getInertia(size: Vector)
    {
        return this.mass * (size.x * size.x + size.y * size.y) / 12;
    }

    update(time: number, delta: number) {
        if (!this.alive) {
            return;
        }

        if (this.mass > 0) {
            const forces = this.getForces();

            this.v = this.v.add(
                forces.F.mul(delta).div(this.getMass())
            );
    
            this.angularVelocity += forces.Torque / this.getMass() * delta;    
        }

        this.pos = this.pos.add(
            this.v.mul(delta)
        );
        
        this.rotation += this.angularVelocity * delta;

        this.forces = Forces.Zero;
    }

    getForces(): Forces {
        return this.forces.add(new Forces(
            Environment.G.mul(this.getMass()),
            0
        ));
    }
}

export default Body;