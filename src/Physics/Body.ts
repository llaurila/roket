import Vector from "./Vector";
import IUpdatable from "./IUpdatable";
import Forces from "./Forces";
import UniqueIdProvider from "../UniqueIdProvider";
import PhysicsEngine from "./PhysicsEngine";
import CircleCollider from "./CircleCollider";
import ICollisionEvent from "./ICollisionEvent";
import TriangleCollider from "./TriangleCollider";

class Body implements IUpdatable {
    public physics?: PhysicsEngine;
    public id: number;
    public pos: Vector;
    public v: Vector = Vector.Zero;
    public rotation: number = 0;
    public angularVelocity: number = 0;
    public mass: number = 0;
    public centerOfMass: Vector = Vector.Zero;
    public circleCollider?: CircleCollider;
    public triangleCollider?: TriangleCollider;
    public colliderCallbacks: ((e: ICollisionEvent) => void)[] = [];

    protected _alive: boolean = true;
    private forces: Forces = Forces.Zero;

    constructor(position: Vector) {
        this.id = UniqueIdProvider.next();
        this.pos = position;
    }

    onCollision(callback: (e: ICollisionEvent) => void) {
        this.colliderCallbacks.push(callback);
    }

    signalCollision(target: Body): void {
        for (let callback of this.colliderCallbacks) {
            callback({
                target
            });
        }
    }

    get alive() {
        return this._alive;
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
        let forces = this.forces;

        if (this.physics) {
            forces = forces.add(new Forces(
                this.physics.environment.G.mul(this.getMass()),
                0
            ));
        }

        return forces;
    }
}

export default Body;