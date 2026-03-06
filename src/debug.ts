import { Config } from "./config";
import Game from "@/Game";
import { getColorString, getGray } from "@/Graphics/Color";
import type Level from "@/Level";
import NPCAIController from "@/Levels/NPCAIController";
import { radToDeg } from "@/Utils";

const DEBUG_PANEL_BORDER_GRAY = 0.8;
const DEBUG_PANEL_BACKGROUND_ALPHA = 0.6;

export function drawFps(ctx: CanvasRenderingContext2D, fps: number) {
    const MARGIN = 20;

    if (Game.debugMode) {
        ctx.fillStyle = "white";
        ctx.font = `${Config.hud.fontSize * 2}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "bottom";
        ctx.fillText(`${Math.round(fps)} FPS`, MARGIN, ctx.canvas.height - MARGIN);
    }
}

export function drawNpcAiDebug(ctx: CanvasRenderingContext2D, level: Level) {
    if (!Game.debugMode) {
        return;
    }

    const controller = getNpcAiController(level);
    const debugState = controller?.getLastDebugState();

    if (!debugState) {
        return;
    }

    const POS_X = 330;
    const POS_Y = 40;
    const PADDING = 12;
    const WIDTH = 240;
    const lineHeight = Config.hud.lineHeight;

    const rows = [
        "NPC AI",
        `DISTANCE: ${fmt(debugState.distance)}`,
        `CLOSING LIMIT: ${fmt(debugState.closingSpeedLimit)}`,
        `ANGLE ERROR: ${fmt(radToDeg(debugState.angleError))} DEG`,
        `FORWARD THR: ${fmt(debugState.forwardThrottle)}`,
        `TURN CMD: ${fmt(debugState.turnCommand)}`,
        `DESIRED V: ${debugState.desiredVelocity.toString()}`,
        `DESIRED A: ${debugState.desiredAcceleration.toString()}`,
        `REL POS: ${debugState.relativePosition.toString()}`,
        `REL VEL: ${debugState.relativeVelocity.toString()}`,
        `MAX FWD A: ${fmt(debugState.capabilities.maxForwardAcceleration)}`,
        `MAX ANG A: ${fmt(debugState.capabilities.maxAngularAcceleration)}`,
        "L/R THR: " +
        `${fmt(debugState.ship.engines.left.throttle)} / ` +
        `${fmt(debugState.ship.engines.right.throttle)}`,
    ];

    const height = PADDING * 2 + rows.length * lineHeight;

    ctx.save();
    ctx.fillStyle = getColorString({ R: 0, G: 0, B: 0, A: DEBUG_PANEL_BACKGROUND_ALPHA });
    ctx.fillRect(POS_X, POS_Y, WIDTH, height);

    ctx.strokeStyle = getColorString(getGray(DEBUG_PANEL_BORDER_GRAY));
    ctx.lineWidth = 1;
    ctx.strokeRect(POS_X, POS_Y, WIDTH, height);

    ctx.font = `${Config.hud.fontSize}px ${Config.typography.fontFamily}`;
    ctx.textBaseline = "top";

    rows.forEach((row, index) => {
        ctx.fillStyle = index === 0
            ? getColorString(Config.typography.emphasisColor)
            : getColorString(Config.typography.defaultColor);
        ctx.fillText(row, POS_X + PADDING, POS_Y + PADDING + index * lineHeight);
    });

    ctx.restore();
}

function getNpcAiController(level: Level): NPCAIController | undefined {
    if (!("ai" in level)) {
        return undefined;
    }

    const ai = (level as { ai?: unknown }).ai;

    return ai instanceof NPCAIController
        ? ai
        : undefined;
}

function fmt(value: number): string {
    return value.toFixed(2);
}
