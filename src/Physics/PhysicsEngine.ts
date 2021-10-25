import IUpdatable from "./IUpdatable";
import { IEnvironment } from "./Environment";
import { PhysicsEngineUpdater } from "./PhysicsEngineUpdater";
import Body from "./Body";
import Vector from "./Vector";

class PhysicsEngine {
    public time = 0;
    public environment: IEnvironment;

    private objects: Set<IUpdatable> = new Set<IUpdatable>();

    constructor(environment: IEnvironment) {
        this.environment = environment;
    }

    get count() {
        return this.objects.size;
    }

    getNearestObject(pos: Vector, criteria: (obj: IUpdatable) => boolean): Body|undefined {
        const objects = this
            .filter(obj => obj.alive && obj instanceof Body)
            .filter(criteria)
            .map(obj => <Body>obj)
            .sort((a, b) => a.pos.sub(pos).length() - b.pos.sub(pos).length());

        if (objects.length > 0) {
            return objects[0];
        }

        return undefined;
    }

    filter(criteria: (obj: IUpdatable) => boolean): IUpdatable[] {
        const filtered = [];
        for (const obj of this.objects.values()) {
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

        const objects = Array.from(this.objects);

        const updater = new PhysicsEngineUpdater(time, delta, objects);
        updater.update();
    }

    cleanUp(): void {
        const toDelete: IUpdatable[] = [];

        this.objects.forEach(obj => {
            if (!obj.alive) {
                toDelete.push(obj);
            }
        });

        for (const obj of toDelete) {
            this.remove(obj);
        }
    }
}

export default PhysicsEngine;
