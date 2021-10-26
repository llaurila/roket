/* eslint-disable no-magic-numbers */
import { IConfig } from "./config.types";
import { getGray } from "./Graphics/Color";
import Vector from "./Physics/Vector";

const WINDOW_ALPHA = 0.9;

const ENGINE_DEFAULTS = {
    maxThrust: 7000,
    consumption: 0.0001675,
    particleVelocityMin: 20,
    particleVelocityMax: 80,
    particleRateMax: 200,
    maxOutputChangeRate: 15000
};

const DEFAULT_FONT_COLOR = { R: 0.10, G: 0.95, B: 0.95, A: 1 };

export const Config: IConfig = {
    physics: {
        updateFreqHz: 60
    },

    typography: {
        fontFamily: "Roboto Mono",
        defaultColor: DEFAULT_FONT_COLOR,
        titleFontSize: 22,
        messageFontSize: 18,
        defaultLineHeight: 10,
        errorColor: { R: 0.55, G: 0.12, B: 0.16, A: 1 },
        emphasisColor: { R: 1.00, G: 0.50, B: 0.00, A: 1 }
    },

    ui: {
        window: {
            backgroundColorTop: { R: 0.00, G: 0.21, B: 0.21, A: WINDOW_ALPHA },
            backgroundColorBottom: { R: 0.02, G: 0.04, B: 0.07, A: WINDOW_ALPHA },
            borderColor: { R: 0.10, G: 0.95, B: 0.95, A: 1 },
            borderWidth: 0.5,
            titleBackgroundColor: { R: 0.09, G: 0.22, B: 0.24, A: WINDOW_ALPHA },
            titleBackgroundColorError: { R: 0.01, G: 0.10, B: 0.12, A: WINDOW_ALPHA },
            titleFontColor: getGray(1),
            titleHeight: 30,
            titleMargin: 6,
            titlePadding: 8,
            titleFontSize: 14,
            fadeOutDuration: 0.5
        },

        alert: {
            windowWidth: 500,
            fontSize: 13,
            fontColor: DEFAULT_FONT_COLOR,
            lineHeight: 20,
            padding: 16
        }
    },

    hud: {
        fontSize: 14,
        lineHeight: 18
    },

    radar: {
        margin: 20,
        circleOpacity: 0.25,
        dotRadius: 4,
        labelOffset: 25,
        fontSize: 10,
        fuelColor: { R: 0, G: 1, B: 0, A: 0.5 }
    },

    cosmos: {
        starDensity: 400,
        starBrighnessMin: 0.25,
        starBrighnessMax: 1.00
    },

    ship: {
        mass: 800,
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
