import type { IColor } from "@/Graphics/Color";
import type Vector from "@/Physics/Vector";

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

export interface IConfig {
    physics: {
        updateFreqHz: number;
    }

    typography: {
        fontFamily: string;
        defaultColor: IColor;
        titleFontSize: number;
        messageFontSize: number;
        defaultLineHeight: number;
        errorColor: IColor;
        emphasisColor: IColor;
    },

    ui: {
        window: {
            margin: number;
            backgroundColorTop: IColor;
            backgroundColorBottom: IColor;
            borderColor: IColor;
            borderWidth: number;
            titleHeight: number;
            titleBackgroundColor: IColor;
            titleBackgroundColorError: IColor;
            titleFontColor: IColor;
            titlePadding: number;
            titleFontSize: number;
            fadeOutDuration: number;
        }

        mainMenu: {
            windowWidth: number;
        }

        alert: {
            windowWidth: number;
            fontSize: number;
            fontColor: IColor;
            lineHeight: number;
            padding: number;
        }

        missionControl: {
            windowWidth: number;
            fontSize: number;
            lineHeight: number;
        }

        control: {
            backgroundColor: IColor;
        }

        objectives: {
            successColor: IColor;
            failureColor: IColor;
        }
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
        beaconColor: IColor;
        fuelColor: IColor;
        numberOfNearestFuelToDisplay: number;
        headingMarkerRadius: number;
        headingMarkerColor: IColor;
        vectorMarkerRadius: number;
        vectorMarkerColor: IColor;
        minVectorMarkerVelocity: number;
    }

    barGauge: {
        width: number;
        height: number;
        padding: number;
        captionOffset: number;
        maxColor: IColor;
        halfColor: IColor;
        minColor: IColor;
    }

    cosmos: {
        starDensity: number; // stars/km²
        starBrightnessMax: number;
        starBrightnessMin: number;
    }

    camera: ICameraConfig;

    ship: {
        mass: number;
        length: number;
        colliderRelativeSize: number;
        fuelTankCapacity: number;
        engineLeft: IEngineConfig;
        engineRight: IEngineConfig;

        maxSafeAngularVelocity: number;
        engineChokeModeMultiplier: number;

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

    beacon: {
        radius: number;
        opacityMin: number;
        opacityMax: number;
        blinkInterval: number;
        fadeDuration: number;
        detectionRadius: number;
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

export interface ICameraConfig {
    defaultZoom: number;
    minZoom: number;
    zoomVelocityCap: number;
    zoomScale: number;
    lookAheadMultiplier: number;
    maxLookAhead: number;
    panSmoothing: number;
}
