import IUpdatable from "./IUpdatable";
import { IEnvironment } from "./Environment";
import CircleCollider from "./CircleCollider";
import Body from "./Body";
import TriangleCollider from "./TriangleCollider";

class PhysicsEngine {
    time: number = 0;
    environment: IEnvironment;
    private objects: Set<IUpdatable> = new Set<IUpdatable>();

    constructor(environment: IEnvironment) {
        this.environment = environment;
    }

    get count() {
        return this.objects.size;
    }

    filter(criteria: (obj: IUpdatable) => boolean): IUpdatable[] {
        let filtered = [];
        for (let obj of this.objects.values()) {
            if (criteria(obj)) {
                filtered.push(obj);
            }
        }
        return filtered;
    }

    add(obj: IUpdatable): void {
        obj.physics = this;
        this.objects.add(obj);
    }

    remove(obj: IUpdatable): void {        
        if (!this.objects.delete(obj)) {
            throw new Error("Object not part of this world.");
        }
        obj.physics = undefined;
    }

    update(time: number, delta: number) {
        this.time = time;
        
        let objects = Array.from(this.objects);

        for (let i = 0; i < objects.length; i++) {
            const a = objects[i];

            if (a.alive) {
                a.update(time, delta);

                if (a instanceof Body) {
                    for (let j = i + 1; j < objects.length; j++) {
                        const b = objects[j];
                        if (b instanceof Body) {
                            /*if (TriangleCollider.check(a, b)) {
                                a.signalCollision(b);
                                b.signalCollision(a);
                            }*/
                            if (CircleCollider.check(a, b)) {
                                a.signalCollision(b);
                                b.signalCollision(a);
                            }
                        }
                    }
                }
            }
        }
    }

    cleanUp(): void {
        let toDelete: IUpdatable[] = [];

        this.objects.forEach(obj => {
            if (!obj.alive) {
                toDelete.push(obj);
            }
        });

        for (let obj of toDelete) {
            this.remove(obj);            
        }        
    }
}

export default PhysicsEngine;