import type { Viewport } from "@/Graphics/Viewport";

export interface IWeaponHudGauge {
    caption: string;
    current: number;
    max: number;
}

export interface IWeapon {
    readonly type: string;
    setTriggerDown: (down: boolean) => void;
    update: (time: number, delta: number) => void;
    draw: (viewport: Viewport) => void;
    getHudGauge: () => IWeaponHudGauge | null;
}
