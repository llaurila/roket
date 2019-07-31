import IUpdatable from "./IUpdatable";

class Physics {
    private objects: Set<IUpdatable> = new Set<IUpdatable>();

    get count() {
        return this.objects.size;
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
        this.objects.forEach(obj => {
            if (obj.alive) {
                obj.update(time, delta);
            }
        });
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

export default Physics;