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
        inputColor: IColor;
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

    laser: {
        maxEnergy: number;
        energyDrainPerSecond: number;
        rechargePerSecond: number;
        rechargeDelay: number;
        range: number;
        lineWidth: number;
        color: IColor;
        soundVolume: number;
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
        starTints: {
            weight: number;
            rMin: number;
            gMin: number;
            bMin: number;
        }[];
        twinkle: {
            amountMin: number;
            amountMax: number;
            speedMinHz: number;
            speedMaxHz: number;
            rareAmountMultiplier: number;
        };
    }

    camera: ICameraConfig;

    ship: {
        mass: number;
        length: number;
        colliderRelativeSize: number;
        fuelTankCapacity: number;
        engineLeft: IEngineConfig;
        engineRight: IEngineConfig;

        engineChokeModeMultiplier: number;

        color: IColor;

        shield: {
            radiusRelativeSize: number;
            maxIntegrity: number;
            rechargePerSecond: number;
            rechargeDelay: number;
            collisionRestitution: number;
            impactDamageScale: number;
            minImpactSpeed: number;
            color: IColor;
            idleOpacity: number;
            flashOpacityBoost: number;
            flashFadePerSecond: number;
        }
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
        strength: number;
        coolDownPerSecond: number;
        explosionParticleCount: number;
        explosionVelocityMax: number;
        explosionSoundDuration: number;
    }

    beacon: {
        radius: number;
        opacityMin: number;
        opacityMax: number;
        blinkInterval: number;
        fadeDuration: number;
        detectionRadius: number;
    }

    gravityWell: {
        ringCount: number;
        lineWidth: number;
        animationHz: number;
        minVisualRadiusRelative: number;
        opacityMin: number;
        opacityRange: number;
        opacityMax: number;
        activeOpacityBoost: number;
        color: IColor;
    }

    lightningMine: {
        range: number;
        pulseInterval: number;
        chargeDuration: number;
        pulseFlashDuration: number;
        shieldDrainPerPulse: number;
        velocityMultiplierPerPulse: number;
        shieldRechargeLockSeconds: number;
        lineWidth: number;
        idleOpacity: number;
        chargingOpacity: number;
        pulseOpacity: number;
        ambientArcCount: number;
        ambientArcSpan: number;
        proximityArcCount: number;
        proximityArcSpread: number;
        proximityRange: number;
        maxProximityTargets: number;
        arcJitter: number;
        arcOvershoot: number;
        idleColor: IColor;
        chargingColor: IColor;
        pulseColor: IColor;
    }

    meteor: {
        cornerCountMin: number;
        cornerCountMax: number;
        lineWidth: number;
        vertexRadiusMinRelative: number;
        vertexRadiusMaxRelative: number;
        collisionRestitution: number;
        minDiameter: number;
        strength: number;
        splitDriftSpeed: number;
        splitGap: number;
        explosionParticleCount: number;
        explosionVelocityMax: number;
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

export interface ICameraConfig {
    defaultZoom: number;
    minZoom: number;
    zoomVelocityCap: number;
    zoomScale: number;
    lookAheadMultiplier: number;
    maxLookAhead: number;
    panSmoothing: number;
}

