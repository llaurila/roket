import Vector from "./Vector";
import type IUpdatable from "./IUpdatable";
import Forces from "./Forces";
import UniqueIdProvider from "../UniqueIdProvider";
import type PhysicsEngine from "./PhysicsEngine";
import type CircleCollider from "./CircleCollider";
import type ICollisionEvent from "./ICollisionEvent";
import type TriangleCollider from "./TriangleCollider";

class Body implements IUpdatable {
    public physics?: PhysicsEngine;
    public id: number;
    public pos: Vector;
    public v: Vector = Vector.Zero;
    public rotation = 0;
    public angularVelocity = 0;
    public mass = 0;
    public centerOfMass: Vector = Vector.Zero;
    public circleCollider?: CircleCollider;
    public triangleCollider?: TriangleCollider;
    public colliderCallbacks: ((e: ICollisionEvent) => void)[] = [];

    protected _alive = true;
    private forces: Forces = Forces.Zero;

    public constructor(position: Vector) {
        this.id = UniqueIdProvider.next();
        this.pos = position;
    }

    public onCollision(callback: (e: ICollisionEvent) => void) {
        this.colliderCallbacks.push(callback);
    }

    public signalCollision(target: Body): void {
        for (const callback of this.colliderCallbacks) {
            callback({
                target
            });
        }
    }

    public get alive() {
        return this._alive;
    }

    public getHeading() {
        return Vector.Up.rotate(this.rotation);
    }

    public getMass(): number {
        return this.mass;
    }

    public applyForce(F: Vector, point: Vector): void {
        const Torque = (point.sub(this.centerOfMass)).cross(F);
        this.forces = this.forces.add(
            new Forces(F, Torque)
        );
    }

    public update(_time: number, delta: number) {
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

    public getForces(): Forces {
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
