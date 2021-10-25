/* eslint-disable no-magic-numbers */
import { getGray, IColor } from "./Graphics/Color";
import Vector from "./Physics/Vector";

/* Units:
 *   - UI (including font size): Pixels
 *   - Color: RGBA (IColor interface)
 *   - Length/distance: Meters
 *   - Weight: Kilograms
 *   - Volume: Liters
 *   - Angle: Degrees
 *   - Force: Newtons
 *   - Angular velocity: rad/s
 *   - Relative: To 1 (100% = 1)
 */

interface IConfig {
    typography: {
        fontFamily: string;
        defaultColor: IColor;
        titleFontSize: number;
        messageFontSize: number;
        defaultLineHeight: number;
    }

    hud: {
        fontSize: number;
        lineHeight: number;
    }

    radar: {
        margin: number;
        circleOpacity: number;
        dotRadius: number;
        labelOffset: number;
        fontSize: number;
        fuelColor: IColor;
    }

    cosmos: {
        starDensity: number; // stars/km²
        starBrighnessMax: number;
        starBrighnessMin: number;
    }

    ship: {
        length: number;
        colliderRelativeSize: number;
        fuelTankCapacity: number;
        engineLeft: IEngineConfig;
        engineRight: IEngineConfig;

        // If the ship spins faster than this it will explode.
        maxSafeAngularVelocity: number;

        color: IColor;
    }

    fuel: {
        mass: number;
    }

    fuelCapsule: {
        length: number;
        colliderRelativeSize: number;
        volume: number;
        opacityMin: number;
        opacityMax: number;
        pulseHz: number;
        color: IColor;
    }
}

export interface IEngineConfig {
    maxThrust: number;
    consumption: number;
    maxOutputChangeRate: number;
    position: Vector;
    angle: number;
    particleVelocityMin: number;
    particleVelocityMax: number;
    particleRateMax: number;
}

const ENGINE_DEFAULTS = {
    maxThrust: 7000,
    consumption: 0.0001675,
    particleVelocityMin: 20,
    particleVelocityMax: 80,
    particleRateMax: 200,
    maxOutputChangeRate: 15000
};

export const Config: IConfig = {
    typography: {
        fontFamily: "Nunito",
        defaultColor: getGray(0.95),
        titleFontSize: 22,
        messageFontSize: 18,
        defaultLineHeight: 10
    },

    hud: {
        fontSize: 14,
        lineHeight: 18
    },

    radar: {
        margin: 20,
        circleOpacity: 0.25,
        dotRadius: 4,
        labelOffset: 20,
        fontSize: 10,
        fuelColor: { R: 0, G: 1, B: 0, A: 0.5 }
    },

    cosmos: {
        starDensity: 400,
        starBrighnessMin: 0.25,
        starBrighnessMax: 1.00
    },

    ship: {
        length: 6,
        colliderRelativeSize: 1.6,
        fuelTankCapacity: 170,
        engineLeft: {
            ...ENGINE_DEFAULTS,
            position: new Vector(-0.5, -4),
            angle: -12
        },
        engineRight: {
            ...ENGINE_DEFAULTS,
            position: new Vector(+0.5, -4),
            angle: +12
        },
        maxSafeAngularVelocity: 20,
        color: getGray(0.65)
    },

    fuel: {
        mass: 0.95
    },

    fuelCapsule: {
        length: 8,
        colliderRelativeSize: 1.25,
        volume: 25,
        opacityMin: 0.75,
        opacityMax: 1.00,
        pulseHz: 0.5,
        color: { R: 0, G: 1, B: 0, A: 1 }
    }
};
