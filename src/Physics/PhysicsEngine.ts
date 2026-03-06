import type IUpdatable from "./IUpdatable";
import type { IEnvironment } from "./Environment";
import { PhysicsEngineUpdater } from "./PhysicsEngineUpdater";
import Body from "./Body";
import type IForceField from "./IForceField";
import type Vector from "./Vector";

class PhysicsEngine {
    public time = 0;
    public environment: IEnvironment;

    private objects: Set<IUpdatable> = new Set<IUpdatable>();

    public constructor(environment: IEnvironment) {
        this.environment = environment;
    }

    public get count() {
        return this.objects.size;
    }

    public getNearestObject<T>(pos: Vector, criteria: (obj: IUpdatable) => boolean): T|undefined {
        const objects = this
            .filter(obj => obj.alive && obj instanceof Body)
            .filter(criteria)
            .map(obj => (obj as Body))
            .sort((a, b) => a.pos.sub(pos).length() - b.pos.sub(pos).length());

        if (objects.length > 0) {
            return objects[0] as T;
        }

        return undefined;
    }

    public filter<T extends IUpdatable>(criteria: (obj: IUpdatable) => obj is T): T[];
    public filter(criteria: (obj: IUpdatable) => boolean): IUpdatable[];
    public filter(criteria: (obj: IUpdatable) => boolean): IUpdatable[] {
        const filtered: IUpdatable[] = [];
        for (const obj of this.objects.values()) {
            if (criteria(obj)) {
                filtered.push(obj);
            }
        }
        return filtered;
    }

    public add(obj: IUpdatable): void {
        obj.physics = this;
        this.objects.add(obj);
    }

    public getForceFields(): IForceField[] {
        return this.filter(isForceField);
    }

    public remove(obj: IUpdatable): void {
        if (!this.objects.delete(obj)) {
            throw new Error("Object not part of this world.");
        }
        obj.physics = undefined;
    }

    public update(time: number, delta: number) {
        this.time = time;

        const objects = Array.from(this.objects);

        const updater = new PhysicsEngineUpdater(time, delta, objects);
        updater.update();
    }

    public cleanUp(): void {
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

function isForceField(obj: IUpdatable): obj is IUpdatable & IForceField {
    return "getForceFor" in obj && typeof obj.getForceFor === "function";
}

export default PhysicsEngine;
