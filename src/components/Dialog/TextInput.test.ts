/* eslint-disable no-magic-numbers */
import { afterEach, describe, expect, test, vi } from "vitest";
import Rectangle from "@/Graphics/Rectangle";
import type { Viewport } from "@/Graphics/Viewport";
import Vector from "@/Physics/Vector";
import UIDialog from ".";

class FakeInput extends EventTarget {
    public type = "";
    public value = "";
    public autocomplete = "";
    public maxLength = 0;
    public style: Record<string, string> = {};
    public setAttribute = vi.fn();
    public blur = vi.fn();
}

afterEach(() => vi.unstubAllGlobals());

describe("mobile text input", () => {
    test("uses a native field, synchronizes edits, and hides it when the dialog closes", () => {
        const nativeInput = new FakeInput();
        vi.stubGlobal("navigator", { maxTouchPoints: 1 });
        vi.stubGlobal("window", new EventTarget());
        vi.stubGlobal("document", {
            createElement: () => nativeInput,
            body: { appendChild: vi.fn() }
        });
        const dialog = new UIDialog(300, 150);
        vi.spyOn(dialog, "getContentRect").mockReturnValue(
            new Rectangle(new Vector(10, 20), new Vector(300, 100))
        );
        const input = dialog.addTextInput("PLAYER");
        input.maxLength = 8;
        input.draw({} as Viewport);
        expect(nativeInput.style.display).toBe("block");
        expect(nativeInput.maxLength).toBe(8);
        expect(nativeInput.value).toBe("PLAYER");

        nativeInput.value = "pilot 1!";
        nativeInput.dispatchEvent(new Event("input"));
        expect(input.value).toBe("PILOT1");
        input.value = "ACE";
        expect(nativeInput.value).toBe("ACE");
        dialog.hide();
        expect(nativeInput.style.display).toBe("none");
    });
});
