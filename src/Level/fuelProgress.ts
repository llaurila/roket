import type Fuel from "@/Fuel";

export function getCollectedFuelCount(fuelCapsules: Fuel[]): number {
    return fuelCapsules.filter(f => f.collected).length;
}

export function getRemainingCollectableFuelCount(fuelCapsules: Fuel[]): number {
    return fuelCapsules.filter(f => f.alive && !f.collected).length;
}

export function isFuelCollectionStillPossible(
    fuelCapsules: Fuel[],
    requiredCollectedForSuccess: number
): boolean {
    const maxPossibleCollected =
        getCollectedFuelCount(fuelCapsules) +
        getRemainingCollectableFuelCount(fuelCapsules);

    return maxPossibleCollected >= requiredCollectedForSuccess;
}
