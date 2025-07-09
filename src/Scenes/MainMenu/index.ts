/* eslint-disable no-magic-numbers */
import Cosmos from "@/components/Cosmos";
import { Menu } from "@/components/Menu";
import Game from "@/Game";
import Camera from "@/Graphics/Camera";
import { Graphics, initializeGraphics } from "@/Graphics/Graphics";
import Vector from "@/Physics/Vector";
import logoUrl from "@/assets/logo.svg";
import creatorLogoUrl from "@/assets/creator-logo.svg";
import { ImageLoader } from "@/ImageLoader";
import { Viewport } from "@/Graphics/Viewport";
import { Player } from "@/Player";
import { loadLevel } from "../Gameplay";
import { getQueryStringValue } from "@/Utils";
import UIDialog from "@/components/Dialog";

const ZOOM = 3;
const PARALLAX_SPEED = 10;

const LOGO_ASPECT_RATIO = 0.656;
const LOGO_PROPORTIONS = (new Vector(1, LOGO_ASPECT_RATIO));
const LOGO_DISTANCE_FROM_CORNER = 0.1;
const LOGO_CENTER_RELATIVE = new Vector(LOGO_DISTANCE_FROM_CORNER, LOGO_DISTANCE_FROM_CORNER);
const LOGO_SCALE = 120;

const CREATOR_LOGO_ASPECT_RATIO = 0.783;
const CREATOR_LOGO_PROPORTIONS = new Vector(1, CREATOR_LOGO_ASPECT_RATIO);
const CREATOR_LOGO_MARGIN_XY = 20;
const CREATOR_LOGO_MARGIN = new Vector(CREATOR_LOGO_MARGIN_XY, CREATOR_LOGO_MARGIN_XY);
const CREATOR_LOGO_SCALE = 60;

const logoImage = ImageLoader.get(logoUrl);
const creatorLogoImage = ImageLoader.get(creatorLogoUrl);

let viewport: Viewport;
let graphics: Graphics;
let game: Game;

function update(time: number, _delta: number) {
    viewport.camera.pos.y = time * PARALLAX_SPEED;
}

function draw(viewport: Viewport): void {
    viewport.update();

    const { ctx } = viewport;

    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ctx.imageSmoothingQuality = "high";

    drawLogo(ctx);
    drawCreatorLogo(ctx);

    ctx.save();
    ctx.transform(1, 0, 0, -1, 0, ctx.canvas.height);

    graphics.draw(viewport);

    ctx.restore();
}

function drawLogo(ctx: CanvasRenderingContext2D) {
    const logoSize = LOGO_PROPORTIONS.mul(LOGO_SCALE);
    const logoPos = new Vector(
        ctx.canvas.width * LOGO_CENTER_RELATIVE.x - logoSize.x / 2,
        ctx.canvas.height * LOGO_CENTER_RELATIVE.y - logoSize.y / 2
    );

    ctx.drawImage(logoImage, logoPos.x, logoPos.y, logoSize.x, logoSize.y);
}

function drawCreatorLogo(ctx: CanvasRenderingContext2D) {
    const creatorLogoSize = CREATOR_LOGO_PROPORTIONS.mul(CREATOR_LOGO_SCALE);

    const creatorLogoPos = (new Vector(
        ctx.canvas.width - creatorLogoSize.x,
        ctx.canvas.height - creatorLogoSize.y
    )).sub(CREATOR_LOGO_MARGIN);

    ctx.drawImage(
        creatorLogoImage,
        creatorLogoPos.x,
        creatorLogoPos.y,
        creatorLogoSize.x,
        creatorLogoSize.y
    );
}

export function enterMainMenu() {
    viewport = new Viewport(
        initializeGraphics("game"),
        new Camera(Vector.Zero, ZOOM)
    );

    graphics = new Graphics();

    graphics.add(new Cosmos());

    const menu = new Menu("MAIN MENU");

    const dialog = new UIDialog(400, 150);
    const nameInput = dialog.addTextInput(Player.PL1.name);

    const playerItem = menu.addItem("PLAYER: " + Player.PL1.name);
    playerItem.addEventListener("click", () => {
        nameInput.value = Player.PL1.name;
        dialog.error = false;
        dialog.title = "ENTER PLAYER NAME";
        menu.hide();
        dialog.show();
        nameInput.focus();
    });

    menu.addItem("SETTINGS").disabled = true;

    menu.addItem("START GAME").addEventListener("click", () => {
        exitMainMenu();
        loadLevel(
            getQueryStringValue<number>("level", 1) - 1
        );
    });

    graphics.add(menu);

    dialog.addButton("OK").addEventListener("click", () => {
        try {
            Player.PL1.setName(nameInput.value);
            playerItem.text = "PLAYER: " + Player.PL1.name;
            dialog.hide();
            menu.show();
        }
        catch {
            dialog.error = true;
            dialog.title = "INVALID NAME";
        }
    });
    dialog.addButton("CANCEL").addEventListener("click", () => {
        dialog.hide();
        menu.show();
    });
    dialog.visible = false;
    graphics.add(dialog);

    game = new Game(update, draw, viewport);

    game.start();
}

export function exitMainMenu() {
    game.stop();
}
