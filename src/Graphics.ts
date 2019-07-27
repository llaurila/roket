function initializeGraphics(elementId: string): CanvasRenderingContext2D {
    let canvas = <HTMLCanvasElement>document.getElementById(elementId);

    if (canvas == null) {
        throw new Error(`Canvas '${elementId}' not found.`);
    }

    return <CanvasRenderingContext2D> canvas.getContext("2d");
}

export { initializeGraphics };