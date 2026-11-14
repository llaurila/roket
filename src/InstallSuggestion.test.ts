import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { InstallSuggestion } from "./InstallSuggestion";

class ElementMock extends EventTarget {
    public hidden = false;
    public textContent = "";
}

let elements: Record<string, ElementMock>;
let browser: EventTarget;
let storage: Map<string, string>;

function promptEvent() {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    return Object.assign(event, { prompt: vi.fn().mockResolvedValue(undefined) });
}

beforeEach(() => {
    elements = {
        "install-suggestion": new ElementMock(),
        "install-message": new ElementMock(),
        "install-button": new ElementMock(),
        "install-dismiss": new ElementMock()
    };
    browser = new EventTarget();
    storage = new Map();
    vi.stubGlobal("window", Object.assign(browser, {
        matchMedia: () => ({ matches: false })
    }));
    vi.stubGlobal("document", { getElementById: (id: string) => elements[id] });
    vi.stubGlobal("navigator", { userAgent: "Chrome", platform: "Win32", maxTouchPoints: 0 });
    vi.stubGlobal("sessionStorage", {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => { storage.set(key, value); }
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("InstallSuggestion", () => {
    test("offers the native prompt only in the main menu and consumes it on click", () => {
        const suggestion = new InstallSuggestion();
        const event = promptEvent();
        browser.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        expect(elements["install-suggestion"].hidden).toBe(true);

        suggestion.setMenuVisible(true);
        expect(elements["install-suggestion"].hidden).toBe(false);
        suggestion.setMenuVisible(false);
        expect(elements["install-suggestion"].hidden).toBe(true);
        suggestion.setMenuVisible(true);
        elements["install-button"].dispatchEvent(new Event("click"));
        expect(event.prompt).toHaveBeenCalledOnce();
        expect(elements["install-suggestion"].hidden).toBe(true);
    });

    test("keeps a dismissal for the browser session", () => {
        const suggestion = new InstallSuggestion();
        suggestion.setMenuVisible(true);
        browser.dispatchEvent(promptEvent());
        elements["install-dismiss"].dispatchEvent(new Event("click"));
        browser.dispatchEvent(promptEvent());
        expect(elements["install-suggestion"].hidden).toBe(true);
        expect(storage.get("installSuggestionDismissed")).toBe("true");
        new InstallSuggestion().setMenuVisible(true);
        expect(elements["install-suggestion"].hidden).toBe(true);
    });

    test("shows iOS instructions instead of a native install button", () => {
        vi.stubGlobal("navigator", { userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 1 });
        new InstallSuggestion().setMenuVisible(true);
        expect(elements["install-suggestion"].hidden).toBe(false);
        expect(elements["install-button"].hidden).toBe(true);
        expect(elements["install-message"].textContent).toContain("Add to Home Screen");
    });

    test("does not suggest installation when already installed", () => {
        vi.stubGlobal("navigator", {
            userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 1, standalone: true
        });
        new InstallSuggestion().setMenuVisible(true);
        expect(elements["install-suggestion"].hidden).toBe(true);
    });

    test("does not show a suggestion without a supported install method", () => {
        new InstallSuggestion().setMenuVisible(true);
        expect(elements["install-suggestion"].hidden).toBe(true);
    });

    test("does not show the prompt in an installed fullscreen app", () => {
        vi.stubGlobal("window", Object.assign(browser, {
            matchMedia: (query: string) => ({ matches: query === "(display-mode: fullscreen)" })
        }));
        new InstallSuggestion().setMenuVisible(true);
        browser.dispatchEvent(promptEvent());
        expect(elements["install-suggestion"].hidden).toBe(true);
    });

    test("can be dismissed when session storage is unavailable", () => {
        vi.stubGlobal("sessionStorage", {
            getItem: () => { throw new Error("Unavailable"); },
            setItem: () => { throw new Error("Unavailable"); }
        });
        new InstallSuggestion().setMenuVisible(true);
        browser.dispatchEvent(promptEvent());
        elements["install-dismiss"].dispatchEvent(new Event("click"));
        expect(elements["install-suggestion"].hidden).toBe(true);
    });

    test("hides the suggestion when the app is installed", () => {
        new InstallSuggestion().setMenuVisible(true);
        browser.dispatchEvent(promptEvent());
        browser.dispatchEvent(new Event("appinstalled"));
        expect(elements["install-suggestion"].hidden).toBe(true);
    });
});
