import type IDrawable from "./IDrawable";
import type Camera from "./Camera";

class Graphics {
    private objects: Set<IDrawable> = new Set<IDrawable>();

    public get count() {
        return this.objects.size;
    }

    public add(obj: IDrawable): void {
        obj.graphics = this;
        this.objects.add(obj);
    }

    public remove(obj: IDrawable): void {
        if (!this.objects.delete(obj)) {
            throw new Error("Object not part of this graphics.");
        }
        obj.graphics = undefined;
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        this.objects.forEach(obj => {
            if (obj.alive) {
                obj.draw(ctx, camera);
            }
        });
    }

    public cleanUp(): void {
        const toDelete: IDrawable[] = [];

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

function initializeGraphics(elementId: string): CanvasRenderingContext2D {
    const canvas = document.getElementById(elementId) as HTMLCanvasElement;

    if (canvas == null) {
        throw new Error(`Canvas '${elementId}' not found.`);
    }

    return canvas.getContext("2d") as CanvasRenderingContext2D;
}

export { Graphics, initializeGraphics };
