import IDrawable from "./IDrawable";
import Camera from "./Camera";

class Graphics {
    private objects: Set<IDrawable> = new Set<IDrawable>();

    get count() {
        return this.objects.size;
    }

    add(obj: IDrawable): void {
        obj.graphics = this;
        this.objects.add(obj);
    }

    remove(obj: IDrawable): void {        
        if (!this.objects.delete(obj)) {
            throw new Error("Object not part of this graphics.");
        }
        obj.graphics = undefined;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        this.objects.forEach(obj => {
            if (obj.alive) {
                obj.draw(ctx, camera);
            }
        });
    }

    cleanUp(): void {
        let toDelete: IDrawable[] = [];

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

function initializeGraphics(elementId: string): CanvasRenderingContext2D {
    let canvas = <HTMLCanvasElement>document.getElementById(elementId);

    if (canvas == null) {
        throw new Error(`Canvas '${elementId}' not found.`);
    }

    return <CanvasRenderingContext2D> canvas.getContext("2d");
}

export { Graphics, initializeGraphics };