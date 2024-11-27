/* eslint-disable no-magic-numbers */
class RNG {
    private seed: number;

    public constructor(seed: number) {
        this.seed = seed;
    }

    public next(min = 0, max = 1) {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        const rnd = this.seed / 233280;
        return min + rnd * (max - min);
    }
}

export default RNG;
