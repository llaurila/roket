/* eslint-disable no-magic-numbers */
import { afterEach, describe, expect, test, vi } from "vitest";
import Pointer from "@/Controls/Pointer";
import Rectangle from "@/Graphics/Rectangle";
import type { Viewport } from "@/Graphics/Viewport";
import Vector from "@/Physics/Vector";
import { Menu } from ".";
import UIDialog from "../Dialog";

afterEach(() => vi.restoreAllMocks());

describe("menu and dialog presses", () => {
    test("activates only the tapped menu item and ignores the press that reveals a dialog", () => {
        vi.spyOn(Pointer, "getPressId").mockReturnValue(1);
        vi.spyOn(Pointer, "getPressPosition").mockReturnValue(new Vector(30, 75));
        const menu = new Menu();
        vi.spyOn(menu, "getContentRect").mockReturnValue(
            new Rectangle(new Vector(0, 0), new Vector(300, 180))
        );
        const first = menu.addItem("PLAYER");
        const second = menu.addItem("SETTINGS");
        const dialog = new UIDialog(300, 190);
        const firstClick = vi.fn();
        const secondClick = vi.fn(() => { dialog.show(); });
        first.addEventListener("click", firstClick);
        second.addEventListener("click", secondClick);
        const viewport = {} as Viewport;

        first.update(viewport);
        second.update(viewport);
        expect(firstClick).not.toHaveBeenCalled();
        expect(secondClick).toHaveBeenCalledOnce();
        expect(dialog.shouldIgnorePointerInput()).toBe(true);

        vi.spyOn(Pointer, "getPressId").mockReturnValue(2);
        expect(dialog.shouldIgnorePointerInput()).toBe(false);
        menu.show();
        expect(menu.acceptsPress()).toBe(false);
    });

    test("settings controls respond to distinct presses without click-through", () => {
        const pressId = vi.spyOn(Pointer, "getPressId").mockReturnValue(1);
        const position = vi.spyOn(Pointer, "getPressPosition").mockReturnValue(new Vector(20, 20));
        const dialog = new UIDialog(300, 190);
        vi.spyOn(dialog, "getContentRect").mockReturnValue(
            new Rectangle(new Vector(0, 0), new Vector(300, 190))
        );
        const checkbox = dialog.addCheckBox("MUSIC", true);
        const button = dialog.addButton("CLOSE");
        const click = vi.fn();
        button.addEventListener("click", click);
        const viewport = { ctx: { measureText: () => ({ width: 50 }) } } as unknown as Viewport;

        dialog.show();
        checkbox.update(viewport);
        expect(checkbox.checked).toBe(true);
        pressId.mockReturnValue(2);
        checkbox.update(viewport);
        expect(checkbox.checked).toBe(false);
        pressId.mockReturnValue(3);
        position.mockReturnValue(new Vector(260, 165));
        button.update(viewport);
        expect(click).toHaveBeenCalledOnce();
    });
});
