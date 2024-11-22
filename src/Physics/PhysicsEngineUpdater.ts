import Body from "./Body";
import CircleCollider from "./CircleCollider";
import IUpdatable from "./IUpdatable";

export class PhysicsEngineUpdater {
    private time: number;
    private delta: number;
    private objects: IUpdatable[];

    constructor(time: number, delta: number, objects: IUpdatable[]) {
        this.time = time;
        this.delta = delta;
        this.objects = objects;
    }

    update() {
        const { objects } = this;
        for (let i = 0; i < objects.length; i++) {
            this.updateObject(objects[i], i + 1);
        }
    }

    private updateObject(obj: IUpdatable, startFrom: number) {
        if (obj.alive) {
            obj.update(this.time, this.delta);

            if (obj instanceof Body) {
                this.checkForCollisions(startFrom, obj);
            }
        }
    }

    private checkForCollisions(startFrom: number, obj: Body) {
        const { objects } = this;

        for (let j = startFrom; j < objects.length; j++) {
            const b = objects[j];
            if (b instanceof Body) {
                checkBodyForCollision(obj, b);
            }
        }
    }
}

function checkBodyForCollision(obj: Body, b: Body) {
    if (CircleCollider.check(obj, b)) {
        obj.signalCollision(b);
        b.signalCollision(obj);
    }
}
