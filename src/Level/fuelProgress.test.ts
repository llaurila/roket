/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import Fuel from "@/Fuel";
import Vector from "@/Physics/Vector";
import {
    getCollectedFuelCount,
    getRemainingCollectableFuelCount,
    isFuelCollectionStillPossible
} from "./fuelProgress";

function createFuelCapsules(count: number): Fuel[] {
    return Array.from({ length: count }, (_, i) => new Fuel(new Vector(i, 0)));
}

test("collected fuel count only includes collected capsules", () => {
    const [a, b, c] = createFuelCapsules(3);

    a.collected = true;
    b.collected = false;
    c.collected = false;
    c.applyLaserHeat(1);

    expect(getCollectedFuelCount([a, b, c])).toBe(1);
});

test("remaining collectable count excludes exploded capsules", () => {
    const [a, b, c] = createFuelCapsules(3);

    a.collected = true;
    b.applyLaserHeat(1);

    expect(getRemainingCollectableFuelCount([a, b, c])).toBe(1);
});

test("collection is impossible when requirement exceeds collectable total", () => {
    const [a, b] = createFuelCapsules(2);

    a.collected = true;
    b.applyLaserHeat(1);

    expect(isFuelCollectionStillPossible([a, b], 2)).toBe(false);
});

test("collection remains possible when enough capsules can still be collected", () => {
    const [a, b, c] = createFuelCapsules(3);

    a.collected = true;
    b.applyLaserHeat(1);

    expect(isFuelCollectionStillPossible([a, b, c], 2)).toBe(true);
});
