/* eslint-disable no-magic-numbers */
import type { Graphics } from "@/Graphics/Graphics";
import type IDrawable from "@/Graphics/IDrawable";
import type { Viewport } from "@/Graphics/Viewport";
import { getColorString, type IColor } from "@/Graphics/Color";
import Body from "@/Physics/Body";
import Vector from "@/Physics/Vector";
import Ship from "@/Ship";
import { applyLightningMinePulseToShip } from "./effects";
import {
    AMBIENT_PHASE_OFFSET,
    AMBIENT_ROTATION_SPEED,
    ARC_SEGMENTS,
    DISTANCE_FOR_FULL_JITTER,
    EPSILON,
    FULL_CIRCLE,
    MIN_LINE_WIDTH
} from "./constants";
import {
    resolveLightningMineOptions,
    type ILightningMineOptions,
    type LightningMineResolvedOptions
} from "./options";
import { LightningMineState } from "./state";
import {
    getArcForwardOffset,
    getArcOffset,
    getLightningBranchOffset,
    getProximityEndJitter,
    getProximityOvershoot,
    getProximitySpreadJitter,
    shouldSpawnLightningBranch
} from "./arcNoise";

const LIGHTNING_BRANCH_CHANCE = 0.52;

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
        const radius = viewport.toScreenScale(this.options.visualRange);
        const ambientReach = viewport.toScreenScale(this.options.ambientArcReach);

        const { ctx } = viewport;

        ctx.save();
        ctx.lineWidth = Math.max(MIN_LINE_WIDTH, viewport.toScreenScale(this.options.lineWidth));

        this.drawRing(ctx, center, radius);
        this.drawAmbientArcs(ctx, center, radius, ambientReach);
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

        const activeInterval = this.getActivePulseInterval();

        while (this.cycleTime >= activeInterval) {
            this.cycleTime -= activeInterval;
            this.triggerPulse();
        }
    }

    private triggerPulse(): void {
        this.pulseFlash = this.options.pulseFlashDuration;

        this.applyPulseEffects();

        for (const callback of this.pulseCallbacks) {
            callback();
        }
    }

    private applyPulseEffects(): void {
        const targets = this.getShipsInRange(this.options.range);

        for (const ship of targets) {
            applyLightningMinePulseToShip(ship, this.options);
        }
    }

    private getCurrentState(): LightningMineState {
        if (this.pulseFlash > 0) {
            return LightningMineState.Pulse;
        }

        const chargeStart = this.getActivePulseInterval() - this.options.chargeDuration;

        return this.cycleTime >= chargeStart
            ? LightningMineState.Charging
            : LightningMineState.Idle;
    }

    private getActivePulseInterval(): number {
        const hasTargetsInRange = this.getShipsInRange(this.options.range).length > 0;

        return hasTargetsInRange
            ? this.options.inRangePulseInterval
            : this.options.pulseInterval;
    }

    private drawRing(ctx: CanvasRenderingContext2D, center: Vector, radius: number): void {
        ctx.strokeStyle = getColorString(this.getRingColor());

        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, FULL_CIRCLE);
        ctx.stroke();
    }

    private drawAmbientArcs(
        ctx: CanvasRenderingContext2D,
        center: Vector,
        radius: number,
        ambientReach: number
    ): void {
        const count = this.options.ambientArcCount;
        const step = FULL_CIRCLE / Math.max(1, count);

        for (let i = 0; i < count; i++) {
            const angle = this.getAmbientArcAngle(i, step);
            const endAngle = angle + this.options.ambientArcSpan;

            const start = center.add(Vector.UnitX.rotate(angle).mul(radius));
            const end = center.add(Vector.UnitX.rotate(endAngle).mul(radius + ambientReach));

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
        const overshoot = getProximityOvershoot(
            viewport,
            proximity,
            this.options.arcOvershoot,
            this.options.proximityArcReach,
            this.options.proximityArcReachJitter,
            this.time
        );

        for (let i = 0; i < this.options.proximityArcCount; i++) {
            const seed = (i + 1) * 13;
            const spread = this.getProximitySpread(i, proximity, seed);
            const direction = baseDirection.rotate(spread);

            const start = center.add(direction.mul(radius));
            const endJitter = getProximityEndJitter(
                viewport,
                seed,
                proximity,
                direction,
                this.options.proximityArcReachJitter,
                this.time
            );
            const end = shipPos.add(direction.mul(overshoot)).add(endJitter);

            this.drawArc(ctx, start, end, seed, proximity);
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
            const offset = getArcOffset(seed, i, jitterScale, intensity, this.time);
            const forwardOffset = getArcForwardOffset(seed, i, jitterScale, this.time);
            const point = basePoint
                .add(normal.mul(offset))
                .add(tangent.mul(forwardOffset));

            ctx.lineTo(point.x, point.y);

            if (shouldSpawnLightningBranch(seed, i, this.time, LIGHTNING_BRANCH_CHANCE)) {
                const branchSeed = seed * 31 + i;
                const branchOffset = getLightningBranchOffset(
                    tangent,
                    distance,
                    intensity,
                    branchSeed,
                    i,
                    this.time
                );
                const branchEnd = point.add(branchOffset);

                ctx.moveTo(point.x, point.y);
                ctx.lineTo(branchEnd.x, branchEnd.y);
            }
        }

        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    private getAmbientArcAngle(index: number, step: number): number {
        const drift = this.time * AMBIENT_ROTATION_SPEED;
        const phase = index * AMBIENT_PHASE_OFFSET;
        return drift + index * step + Math.sin(this.time + phase) * this.options.proximityArcSpread;
    }

    private getJitterScale(distance: number, intensity: number): number {
        const distanceScale = Math.min(1, distance / DISTANCE_FOR_FULL_JITTER);
        return this.options.arcJitter * distanceScale * (0.45 + intensity * 1.25);
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

    private getProximitySpread(index: number, proximity: number, seed: number): number {
        const count = this.options.proximityArcCount;
        const center = (count - 1) / 2;
        const base = (index - center) * this.options.proximityArcSpread;

        const jitter = getProximitySpreadJitter(
            index,
            proximity,
            seed,
            this.options.proximitySpreadJitter,
            this.time
        );
        return base + jitter;
    }

    private getProximityTargets(): Ship[] {
        return this.getShipsInRange(this.options.proximityRange);
    }

    private getShipsInRange(range: number): Ship[] {
        if (!this.physics) {
            return [];
        }

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
export { LightningMineState };
