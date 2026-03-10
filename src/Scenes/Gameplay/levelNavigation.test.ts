import { describe, expect, test } from "vitest";

import {
    getNextLevelIndex,
    getPreviousLevelIndex,
    hasNextLevel,
    hasPreviousLevel,
} from "./levelNavigation";

describe("level navigation", () => {
    test("caps next level at the final index", () => {
        expect(hasNextLevel(8, 10)).toBe(true);
        expect(getNextLevelIndex(8, 10)).toBe(9);

        expect(hasNextLevel(9, 10)).toBe(false);
        expect(getNextLevelIndex(9, 10)).toBe(9);
        expect(getNextLevelIndex(12, 10)).toBe(9);
    });

    test("caps previous level at zero", () => {
        expect(hasPreviousLevel(1)).toBe(true);
        expect(getPreviousLevelIndex(1)).toBe(0);

        expect(hasPreviousLevel(0)).toBe(false);
        expect(getPreviousLevelIndex(0)).toBe(0);
        expect(getPreviousLevelIndex(-2)).toBe(0);
    });

    test("handles empty level sets without producing negative indices", () => {
        expect(hasNextLevel(0, 0)).toBe(false);
        expect(getNextLevelIndex(0, 0)).toBe(0);
    });
});