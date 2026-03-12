/* eslint-disable no-magic-numbers */
import type { Graphics } from "@/Graphics/Graphics";
import type IDrawable from "@/Graphics/IDrawable";
import type { Viewport } from "@/Graphics/Viewport";
import { getColorString, type IColor } from "@/Graphics/Color";
import Body from "@/Physics/Body";
import Vector from "@/Physics/Vector";
import Ship from "@/Ship";
import {
    AMBIENT_PHASE_OFFSET,
    AMBIENT_ROTATION_SPEED,
    ARC_SEGMENTS,
    DISTANCE_FOR_FULL_JITTER,
    EPSILON,
    FULL_CIRCLE,
    JITTER_PHASE_OFFSET,
    JITTER_TIME_SCALE,
    MIN_LINE_WIDTH
} from "./constants";
import {
    resolveLightningMineOptions,
    type ILightningMineOptions,
    type LightningMineResolvedOptions
} from "./options";

export enum LightningMineState {
    Idle,
    Charging,
    Pulse
}

export class LightningMine extends Body implements IDrawable {
    public graphics?: Graphics;

    private readonly options: LightningMineResolvedOptions;
    private readonly pulseCallbacks: (() => void)[] = [];

    private cycleTime = 0;
    private pulseFlash = 0;
    private time = 0;
    private state = LightningMineState.Idle;
    private proximityTargets: Ship[] = [];

    public constructor(position: Vector, options: ILightningMineOptions = {}) {
        super(position);
        this.options = resolveLightningMineOptions(options);
    }

    public update(time: number, delta: number): void {
        super.update(time, delta);

        this.time = time;
        this.proximityTargets = this.getProximityTargets();

        this.advanceCycle(delta);
        this.state = this.getCurrentState();
        this.pulseFlash = Math.max(0, this.pulseFlash - delta);
    }

    public draw(viewport: Viewport): void {
        const center = viewport.toScreenCoordinates(this.pos);
        const radius = viewport.toScreenScale(this.options.range);

        const { ctx } = viewport;

        ctx.save();
        ctx.lineWidth = Math.max(MIN_LINE_WIDTH, viewport.toScreenScale(this.options.lineWidth));

        this.drawRing(ctx, center, radius);
        this.drawAmbientArcs(ctx, center, radius);
        this.drawProximityArcs(viewport, ctx, center, radius);

        ctx.restore();
    }

    public onPulse(callback: () => void): void {
        this.pulseCallbacks.push(callback);
    }

    public getPulseState(): LightningMineState {
        return this.state;
    }

    public getProximityTargetCount(): number {
        return this.proximityTargets.length;
    }

    private advanceCycle(delta: number): void {
        const dt = Math.max(0, delta);

        this.cycleTime += dt;

        while (this.cycleTime >= this.options.pulseInterval) {
            this.cycleTime -= this.options.pulseInterval;
            this.triggerPulse();
        }
    }

    private triggerPulse(): void {
        this.pulseFlash = this.options.pulseFlashDuration;

        for (const callback of this.pulseCallbacks) {
            callback();
        }
    }

    private getCurrentState(): LightningMineState {
        if (this.pulseFlash > 0) {
            return LightningMineState.Pulse;
        }

        const chargeStart = this.options.pulseInterval - this.options.chargeDuration;

        return this.cycleTime >= chargeStart
            ? LightningMineState.Charging
            : LightningMineState.Idle;
    }

    private drawRing(ctx: CanvasRenderingContext2D, center: Vector, radius: number): void {
        ctx.strokeStyle = getColorString(this.getRingColor());

        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, FULL_CIRCLE);
        ctx.stroke();
    }

    private drawAmbientArcs(ctx: CanvasRenderingContext2D, center: Vector, radius: number): void {
        const count = this.options.ambientArcCount;
        const step = FULL_CIRCLE / Math.max(1, count);

        for (let i = 0; i < count; i++) {
            const angle = this.getAmbientArcAngle(i, step);
            const endAngle = angle + this.options.ambientArcSpan;

            const start = center.add(Vector.UnitX.rotate(angle).mul(radius));
            const end = center.add(Vector.UnitX.rotate(endAngle).mul(radius));

            this.drawArc(ctx, start, end, i + 1, 1);
        }
    }

    private drawProximityArcs(
        viewport: Viewport,
        ctx: CanvasRenderingContext2D,
        center: Vector,
        radius: number
    ): void {
        const targets = this.proximityTargets.slice(0, this.options.maxProximityTargets);

        for (const ship of targets) {
            this.drawProximityArcsForTarget(viewport, ctx, center, radius, ship);
        }
    }

    private drawProximityArcsForTarget(
        viewport: Viewport,
        ctx: CanvasRenderingContext2D,
        center: Vector,
        radius: number,
        ship: Ship
    ): void {
        const shipPos = viewport.toScreenCoordinates(ship.pos);
        const toShip = shipPos.sub(center);
        const distance = toShip.length();

        if (distance <= EPSILON) {
            return;
        }

        const proximity = this.getProximityStrength(ship);
        const baseDirection = toShip.div(distance);
        const overshoot = viewport.toScreenScale(this.options.arcOvershoot);

        for (let i = 0; i < this.options.proximityArcCount; i++) {
            const spread = this.getProximitySpread(i);
            const direction = baseDirection.rotate(spread);

            const start = center.add(direction.mul(radius));
            const end = shipPos.add(direction.mul(overshoot));

            this.drawArc(ctx, start, end, (i + 1) * 13, proximity);
        }
    }

    private drawArc(
        ctx: CanvasRenderingContext2D,
        start: Vector,
        end: Vector,
        seed: number,
        intensity: number
    ): void {
        const delta = end.sub(start);
        const distance = delta.length();

        if (distance <= EPSILON) {
            return;
        }

        const tangent = delta.div(distance);
        const normal = new Vector(-tangent.y, tangent.x);
        const jitterScale = this.getJitterScale(distance, intensity);

        ctx.strokeStyle = getColorString(this.getArcColor(intensity));
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);

        for (let i = 1; i < ARC_SEGMENTS; i++) {
            const t = i / ARC_SEGMENTS;
            const basePoint = start.add(delta.mul(t));
            const offset = this.getArcOffset(seed, i, jitterScale);
            const point = basePoint.add(normal.mul(offset));
            ctx.lineTo(point.x, point.y);
        }

        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    private getAmbientArcAngle(index: number, step: number): number {
        const drift = this.time * AMBIENT_ROTATION_SPEED;
        const phase = index * AMBIENT_PHASE_OFFSET;
        return drift + index * step + Math.sin(this.time + phase) * this.options.proximityArcSpread;
    }

    private getArcOffset(seed: number, segment: number, jitterScale: number): number {
        const phase = seed + segment * JITTER_PHASE_OFFSET + this.time * JITTER_TIME_SCALE;
        return Math.sin(phase) * jitterScale;
    }

    private getJitterScale(distance: number, intensity: number): number {
        const distanceScale = Math.min(1, distance / DISTANCE_FOR_FULL_JITTER);
        return this.options.arcJitter * distanceScale * intensity;
    }

    private getRingColor(): IColor {
        switch (this.state) {
            case LightningMineState.Charging:
                return withOpacity(this.options.chargingColor, this.options.chargingOpacity);

            case LightningMineState.Pulse:
                return withOpacity(this.options.pulseColor, this.options.pulseOpacity);

            case LightningMineState.Idle:
            default:
                return withOpacity(this.options.idleColor, this.options.idleOpacity);
        }
    }

    private getArcColor(intensity: number): IColor {
        const base = this.state === LightningMineState.Pulse
            ? this.options.pulseColor
            : this.options.chargingColor;

        const alpha = this.options.idleOpacity +
            (this.options.pulseOpacity - this.options.idleOpacity) * intensity;

        return withOpacity(base, alpha);
    }

    private getProximityStrength(ship: Ship): number {
        const distance = this.pos.distanceTo(ship.pos);
        const relative = 1 - Math.min(1, distance / this.options.proximityRange);
        return Math.max(0.3, relative);
    }

    private getProximitySpread(index: number): number {
        const count = this.options.proximityArcCount;
        const center = (count - 1) / 2;
        return (index - center) * this.options.proximityArcSpread;
    }

    private getProximityTargets(): Ship[] {
        if (!this.physics) {
            return [];
        }

        const range = this.options.proximityRange;

        return this.physics
            .filter((obj): obj is Ship => obj instanceof Ship && obj.alive)
            .filter(ship => this.pos.distanceTo(ship.pos) <= range);
    }
}

function withOpacity(color: IColor, alpha: number): IColor {
    return {
        ...color,
        A: alpha
    };
}

export default LightningMine;
