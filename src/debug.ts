import { Config } from "./config";
import Game from "@/Game";

export function drawFps(ctx: CanvasRenderingContext2D, fps: number) {
    const MARGIN = 20;

    if (Game.debugMode) {
        ctx.fillStyle = "white";
        ctx.font = `${Config.hud.fontSize * 2}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "bottom";
        ctx.fillText(`${Math.round(fps)} FPS`, MARGIN, ctx.canvas.height - MARGIN);
    }
}
