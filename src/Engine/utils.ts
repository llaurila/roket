import type Engine from ".";

export function calculateEngineOutputChange(
    engine: Engine,
    delta: number
) {
    const maxOutputChangeRate = engine.config.maxOutputChangeRate * engine.choke;

    const targetChange = engine.targetOutput - engine.output;

    return Math.max(
        Math.min(targetChange, maxOutputChangeRate * delta),
        -maxOutputChangeRate  * delta
    );
}
