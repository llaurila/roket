import SprayParticleEngine from "@/Graphics/SprayParticleEngine";
import type Vector from "@/Physics/Vector";
import type { IEngineConfig } from "@/config/types";
import { random } from "@/Utils";
import type Engine from ".";

export const initParticleEngine = (
    engine: Engine,
    pos: Vector,
    config: IEngineConfig
) => new SprayParticleEngine(
    engine.parent.pos.add(pos),
    () => {
        const scale = config.particleVelocityMax - config.particleVelocityMin;

        return random(
            config.particleVelocityMin,
            engine.getThrottle() * scale
        );
    }
);
