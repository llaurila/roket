import SprayParticleEngine from "../Graphics/SprayParticleEngine";
import Vector from "../Physics/Vector";
import { IEngineConfig } from "../config.types";
import { random } from "../Utils";
import Engine from ".";

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
