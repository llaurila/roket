import { getColorString } from "@/Graphics/Color";
import type Ship from "@/Ship";
import { Config } from "@/config";
import type { IWeapon, IWeaponHudGauge } from "./IWeapon";
import { raycastMeteors, type ICircleRaycastHit } from "./raycast";
import type { Viewport } from "@/Graphics/Viewport";
import Vector from "@/Physics/Vector";

const config = Config.laser;
const LASER_CAPTION = "LASER";

export class Laser implements IWeapon {
    public readonly type = "laser";

    private triggerDown = false;
    private firing = false;
    private beamStart = Vector.Zero;
    private beamEnd = Vector.Zero;
    private energy = config.maxEnergy;
    private rechargeLock = 0;
    private lastHit: ICircleRaycastHit | null = null;

    public constructor(private ship: Ship) {}

    public setTriggerDown(down: boolean): void {
        this.triggerDown = down;
    }

    public update(_time: number, delta: number): void {
        if (!this.ship.alive) {
            this.resetState();
            return;
        }

        if (this.canFire()) {
            this.fire(delta);
            return;
        }

        this.stopFiring();
        this.recharge(delta);
    }

    public draw(viewport: Viewport): void {
        if (!this.firing) {
            return;
        }

        const from = viewport.toScreenCoordinates(this.beamStart);
        const to = viewport.toScreenCoordinates(this.beamEnd);

        const { ctx } = viewport;

        ctx.save();
        ctx.strokeStyle = getColorString(config.color);
        ctx.lineWidth = config.lineWidth;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.restore();
    }

    public getHudGauge(): IWeaponHudGauge {
        return {
            caption: LASER_CAPTION,
            current: this.energy,
            max: config.maxEnergy
        };
    }

    public getLastHit(): ICircleRaycastHit | null {
        return this.lastHit;
    }

    private fire(delta: number): void {
        const direction = this.ship.getHeading().normalize();
        const origin = this.ship.getNosePosition();

        this.firing = true;
        this.rechargeLock = config.rechargeDelay;

        this.lastHit = this.ship.physics
            ? raycastMeteors(this.ship.physics, origin, direction, config.range)
            : null;

        this.beamStart = origin;
        this.beamEnd = this.lastHit
            ? this.lastHit.point
            : origin.add(direction.mul(config.range));

        this.lastHit?.body.applyLaserHeat(delta);

        this.energy = Math.max(0, this.energy - config.energyDrainPerSecond * delta);
    }

    private recharge(delta: number): void {
        if (this.energy >= config.maxEnergy) {
            return;
        }

        if (this.rechargeLock > 0) {
            this.rechargeLock = Math.max(0, this.rechargeLock - delta);
            return;
        }

        this.energy = Math.min(config.maxEnergy, this.energy + config.rechargePerSecond * delta);
    }

    private canFire(): boolean {
        return this.triggerDown && this.energy > 0;
    }

    private stopFiring(): void {
        this.firing = false;
        this.lastHit = null;
    }

    private resetState(): void {
        this.stopFiring();
        this.triggerDown = false;
    }
}
