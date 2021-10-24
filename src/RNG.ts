class RNG {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    next(min = 0, max = 1) {
        // eslint-disable-next-line no-magic-numbers
        this.seed = (this.seed * 9301 + 49297) % 233280;
        // eslint-disable-next-line no-magic-numbers
        const rnd = this.seed / 233280;
        return min + rnd * (max - min);
    }
}

export default RNG;
