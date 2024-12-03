import type Engine from ".";
import type { IEngineConfig } from "@/config/types";
import type Camera from "@/Graphics/Camera";
import SprayParticleEngine from "@/Graphics/SprayParticleEngine";
import type Vector from "@/Physics/Vector";
import { random } from "@/Utils";

class ParticleEngineController {
    public on = false;

    private particleEngine: SprayParticleEngine;
    private engine: Engine;
    private config: IEngineConfig;

    public constructor(
        engine: Engine,
        pos: Vector,
        config: IEngineConfig
    ) {
        this.engine = engine;
        this.config = config;
        this.particleEngine = new SprayParticleEngine(
            engine.parent.pos.add(pos),
            () => {
                const scale = config.particleVelocityMax - config.particleVelocityMin;

                return random(
                    config.particleVelocityMin,
                    engine.getThrottle() * scale
                );
            }
        );
    }

    public update(time: number, delta: number) {
        this.particleEngine.pos = this.engine.worldPosition;
        this.particleEngine.originVelocity = this.engine.parent.v;
        this.particleEngine.rotation = this.engine.worldRotation;

        if (this.on) {
            this.start();
        }
        else {
            this.stop();
        }

        this.particleEngine.update(time, delta);
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        this.particleEngine.draw(ctx, camera);
    }

    private start() {
        if (!this.particleEngine.emitting) {
            this.particleEngine.start(
                () => this.engine.relativeOutput * this.config.particleRateMax);
        }
    }

    private stop() {
        if (this.particleEngine.emitting) {
            this.particleEngine.stop();
        }
    }
}

export default ParticleEngineController;
