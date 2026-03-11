// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Store {
    public static persist(key: string, value: string) {
        this.getStorage()?.setItem(key, value);
    }

    public static persistObject<T>(key: string, value: T) {
        const json = JSON.stringify(value);
        this.persist(key, json);
    }

    public static retrieve(key: string): string | null {
        return this.getStorage()?.getItem(key) ?? null;
    }

    public static retrieveObject<T>(key: string): T | null {
        const json = this.retrieve(key);

        if (json === null) {
            return null;
        }

        return JSON.parse(json) as T;
    }

    public static delete(key: string) {
        this.getStorage()?.removeItem(key);
    }

    private static getStorage(): Storage | undefined {
        if (typeof localStorage === "undefined") {
            return undefined;
        }

        return localStorage;
    }
}
