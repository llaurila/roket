import Body from "../Physics/Body";
import type IDrawable from "../Graphics/IDrawable";
import type Polygon from "../Graphics/Polygon";
import type Vector from "../Physics/Vector";
import type Engine from "../Engine";
import FuelTank from "../FuelTank";
import ExplosionParticleEngine from "../Graphics/ExplosionParticleEngine";
import Shapes from "../Graphics/Shapes";
import type { Graphics } from "../Graphics/Graphics";
import CircleCollider from "../Physics/CircleCollider";
import { Config } from "../config";
import { COLOR_WHITE, getColorString, getInterpolatedColor } from "../Graphics/Color";
import { initLeftEngine, initRightEngine, updateEngines } from "./utils";
import ShipConfig from "./config";
import { Stats } from "../Level/Stats";
import type { Viewport } from "@/Graphics/Viewport";
import type { DrawContext } from "@/Graphics/DrawContext";
import type { IShip } from "./types";
import { globalSoundEffects } from "@/Sounds/global-sound-effects";
import type { IWeapon } from "@/Weapons/IWeapon";

const { ship } = Config;

const FULL_CIRCLE = Math.PI * 2;
const SHIELD_FLASH_MAX = 1;
const SHIELD_LINE_WIDTH = 0.2;
const MIN_SHIELD_LINE_WIDTH = 1;

class Ship extends Body implements IShip, IDrawable {
    public static Shape: Polygon = Shapes.Ship.mul(ship.length / ShipConfig.SHAPE_LENGTH);

    public engineLeft: Engine;
    public engineRight: Engine;
    public fuelTank: FuelTank;
    public graphics?: Graphics;
    public circleCollider = new CircleCollider(ship.length / 2 * ship.colliderRelativeSize);
    public shieldCollider = new CircleCollider(ship.length / 2 * ship.shield.radiusRelativeSize);
    public color = ship.color;
    public weapons: IWeapon[] = [];

    public stats: Stats = new Stats();

    private shieldEnabled = false;
    private shieldIntegrity = 0;
    private shieldRechargeLock = 0;
    private shieldFlashIntensity = 0;

    public constructor(position: Vector) {
        super(position);
        this.fuelTank = new FuelTank(ship.fuelTankCapacity);
        this.engineLeft = initLeftEngine(this);
        this.engineRight = initRightEngine(this);
    }

    public update(time: number, delta: number): void {
        super.update(time, delta);

        if (!this.alive) {
            return;
        }

        this.updateShield(delta);
        this.updateSystems(time, delta);
        this.updateStats(delta);
    }

    public hasShield(): boolean {
        return this.shieldEnabled;
    }

    public enableShield(initialIntegrity = ship.shield.maxIntegrity): void {
        this.shieldEnabled = true;
        this.shieldIntegrity = this.clampShieldIntegrity(initialIntegrity);
        this.shieldRechargeLock = 0;
        this.shieldFlashIntensity = 0;
    }

    public disableShield(): void {
        this.shieldEnabled = false;
        this.shieldIntegrity = 0;
        this.shieldRechargeLock = 0;
        this.shieldFlashIntensity = 0;
    }

    public getShieldIntegrity(): number {
        return this.shieldIntegrity;
    }

    public getShieldMaxIntegrity(): number {
        return ship.shield.maxIntegrity;
    }

    public getShieldCollisionRadius(): number {
        return this.shieldCollider.radius;
    }

    public applyVelocityDamp(multiplier: number): void {
        if (!this.alive) {
            return;
        }

        const clampedMultiplier = Math.max(0, Math.min(multiplier, 1));
        this.v = this.v.mul(clampedMultiplier);
    }

    public drainShield(amount: number, rechargeLock = 0): void {
        if (!this.canDrainShield()) {
            return;
        }

        const clampedDrain = this.getDrainAmount(amount);
        if (clampedDrain === 0) {
            return;
        }

        this.applyShieldDrain(clampedDrain, rechargeLock);
    }

    public absorbShieldImpact(relativeSpeed: number): void {
        if (!this.alive || !this.shieldEnabled) {
            return;
        }

        const damage = this.getShieldDamage(relativeSpeed);
        this.drainShield(damage, ship.shield.rechargeDelay);
    }

    public die(): void {
        if (!this.alive) {
            return;
        }

        this._alive = false;
        this.shieldIntegrity = 0;

        globalSoundEffects.playShipDestroyedSound();

        if (this.physics && this.graphics) {
            const explosion = new ExplosionParticleEngine(this.pos, {
                particleCount: 300,
                velocityMin: 0,
                velocityMax: 25,
                originVelocity: this.v
            });

            this.physics.add(explosion);
            this.graphics.add(explosion);
        }
    }

    public getMass(): number {
        return super.getMass() + this.fuelTank.getMass();
    }

    public getNosePosition(): Vector {
        return this.pos.add(Ship.Shape.first.rotate(this.rotation));
    }

    public draw(viewport: Viewport): void {
        if (!this.alive) {
            return;
        }

        this.drawShield(viewport);
        this.drawHull(viewport);
        this.engineLeft.draw(viewport);
        this.engineRight.draw(viewport);

        this.weapons.forEach(weapon => {
            weapon.draw(viewport);
        });
    }

    private updateSystems(time: number, delta: number): void {
        updateEngines([this.engineLeft, this.engineRight], time, delta);
        this.weapons.forEach(weapon => {
            weapon.update(time, delta);
        });
    }

    private updateShield(delta: number): void {
        if (!this.shieldEnabled) {
            return;
        }

        this.shieldFlashIntensity = Math.max(
            0,
            this.shieldFlashIntensity - ship.shield.flashFadePerSecond * delta
        );

        this.shieldRechargeLock = Math.max(0, this.shieldRechargeLock - delta);

        if (this.shieldRechargeLock > 0 || this.shieldIntegrity >= ship.shield.maxIntegrity) {
            return;
        }

        this.shieldIntegrity = this.clampShieldIntegrity(
            this.shieldIntegrity + ship.shield.rechargePerSecond * delta
        );
    }

    private getShieldDamage(relativeSpeed: number): number {
        const effectiveSpeed = Math.max(0, relativeSpeed - ship.shield.minImpactSpeed);

        return effectiveSpeed * effectiveSpeed * ship.shield.impactDamageScale;
    }

    private canDrainShield(): boolean {
        return this.alive && this.shieldEnabled;
    }

    private getDrainAmount(amount: number): number {
        return Math.max(0, amount);
    }

    private applyShieldDrain(amount: number, rechargeLock: number): void {
        this.shieldFlashIntensity = SHIELD_FLASH_MAX;
        this.shieldRechargeLock = Math.max(this.shieldRechargeLock, Math.max(0, rechargeLock));
        this.shieldIntegrity = this.clampShieldIntegrity(this.shieldIntegrity - amount);

        if (this.shieldIntegrity === 0) {
            this.die();
        }
    }

    private clampShieldIntegrity(value: number): number {
        return Math.max(0, Math.min(value, ship.shield.maxIntegrity));
    }

    private drawShield(viewport: Viewport): void {
        if (!this.shieldEnabled) {
            return;
        }

        const opacity = this.getShieldOpacity();
        const color = this.getShieldColor(opacity);
        const screenPosition = viewport.toScreenCoordinates(this.pos);
        const radius = viewport.toScreenScale(this.getShieldCollisionRadius());
        const lineWidth = Math.max(
            MIN_SHIELD_LINE_WIDTH,
            viewport.toScreenScale(SHIELD_LINE_WIDTH)
        );

        const { ctx } = viewport;

        ctx.save();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = getColorString(color);
        ctx.beginPath();
        ctx.arc(screenPosition.x, screenPosition.y, radius, 0, FULL_CIRCLE);
        ctx.stroke();
        ctx.restore();
    }

    private getShieldOpacity(): number {
        return Math.min(
            1,
            ship.shield.idleOpacity + this.shieldFlashIntensity * ship.shield.flashOpacityBoost
        );
    }

    private getShieldColor(opacity: number) {
        return getInterpolatedColor([
            {
                Color: {
                    ...ship.shield.color,
                    A: opacity
                },
                Pos: 0
            },
            {
                Color: {
                    ...COLOR_WHITE,
                    A: opacity
                },
                Pos: 1
            }
        ], this.shieldFlashIntensity);
    }

    private drawHull(viewport: Viewport): void {
        const drawContext: DrawContext = {
            viewport,
            pos: this.pos,
            rotation: this.rotation
        };

        const { ctx } = viewport;

        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = getColorString(this.color);

        Ship.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

        ctx.stroke();
        ctx.restore();
    }

    private updateStats(delta: number): void {
        this.stats = new Stats();

        const { stats, engineLeft, engineRight, angularVelocity } = this;
        const v = this.v.length();

        stats.angularVelocity = Math.abs(angularVelocity);
        stats.distance = v * delta;
        stats.distanceFromBeacon = this.pos.length();

        stats.integrate(engineLeft.stats);
        engineLeft.stats = new Stats();

        stats.integrate(engineRight.stats);
        engineRight.stats = new Stats();

        stats.velocity = v;
    }
}

export default Ship;
