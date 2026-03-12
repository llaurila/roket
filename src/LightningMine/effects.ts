import type Ship from "@/Ship";
import type { LightningMineResolvedOptions } from "./options";

export function applyLightningMinePulseToShip(
    ship: Ship,
    options: LightningMineResolvedOptions
): void {
    ship.applyVelocityDamp(options.velocityMultiplierPerPulse);

    if (!ship.hasShield()) {
        return;
    }

    ship.drainShield(options.shieldDrainPerPulse, options.shieldRechargeLockSeconds);
}
