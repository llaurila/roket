export function getNextLevelIndex(currentLevel: number, levelCount: number): number {
    if (levelCount <= 0) {
        return 0;
    }

    return Math.min(currentLevel + 1, levelCount - 1);
}

export function getPreviousLevelIndex(currentLevel: number): number {
    return Math.max(currentLevel - 1, 0);
}

export function hasNextLevel(currentLevel: number, levelCount: number): boolean {
    return currentLevel < levelCount - 1;
}

export function hasPreviousLevel(currentLevel: number): boolean {
    return currentLevel > 0;
}