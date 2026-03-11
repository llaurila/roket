import { beforeEach, expect, test, vi } from "vitest";
import Fuel from "@/Fuel";
import ExplosionParticleEngine from "@/Graphics/ExplosionParticleEngine";
import { Graphics } from "@/Graphics/Graphics";
import { VacuumOfSpace } from "@/Physics/Environment";
import PhysicsEngine from "@/Physics/PhysicsEngine";
import Vector from "@/Physics/Vector";
import { globalSoundEffects } from "@/Sounds/global-sound-effects";
import { Config } from "@/config";

beforeEach(() => {
    vi.restoreAllMocks();
});

function setupFuel() {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const graphics = new Graphics();
    const fuel = new Fuel(Vector.Zero);

    physics.add(fuel);
    graphics.add(fuel);

    return { physics, fuel };
}

test("fuel explodes from laser heat with large explosion effect", () => {
    const { physics, fuel } = setupFuel();
    const explosionSound = vi.spyOn(globalSoundEffects, "playExplosionSound");

    fuel.applyLaserHeat(Config.fuelCapsule.strength);

    expect(fuel.alive).toBe(false);
    expect(fuel.collected).toBe(false);
    expect(explosionSound).toHaveBeenCalledTimes(1);
    expect(explosionSound).toHaveBeenCalledWith(Config.fuelCapsule.explosionSoundDuration);

    const explosions = physics.filter(
        (obj): obj is ExplosionParticleEngine => obj instanceof ExplosionParticleEngine
    );
    expect(explosions).toHaveLength(1);
    expect(explosions[0].particles).toHaveLength(Config.fuelCapsule.explosionParticleCount);
});

test("fuel cools down between laser hits", () => {
    const { fuel } = setupFuel();
    const halfHeatHit = Config.fuelCapsule.strength * 0.5;

    fuel.applyLaserHeat(halfHeatHit);
    fuel.update(1, 1);
    fuel.applyLaserHeat(halfHeatHit);

    expect(fuel.alive).toBe(true);
});
