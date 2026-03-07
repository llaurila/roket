/* eslint-disable no-magic-numbers */
class RNG {
    private seed: number;

    public constructor(seed: number) {
        this.seed = seed;
    }

    public static deriveSeed(seed: number, key: string): number {
        let derived = seed >>> 0;

        for (let i = 0; i < key.length; i++) {
            derived ^= key.charCodeAt(i);
            derived = Math.imul(derived, 16777619) >>> 0;
        }

        return derived;
    }

    public next(min = 0, max = 1) {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        const rnd = this.seed / 233280;
        return min + rnd * (max - min);
    }

    public nextInt(min: number, max: number): number {
        return Math.floor(this.next(min, max + 1));
    }
}

export default RNG;

