import type { Player } from "./types";

export function storePlayer(): Player|null {
    return deserialize("player");
}

export function retrievePlayer(player: Player): void {
    serialize("player", player);
}

function deserialize<T>(key: string): T|null {
    const raw: string | null = localStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
}

function serialize<T>(key: string, value: T|null): void {
    if (value == null) {
        remove(key);
        return;
    }
    localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: string): void {
    localStorage.removeItem(key);
}
