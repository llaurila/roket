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
import { Config } from "@/config";

export enum MainMenuMode {
    Loading = "loading",
    WaitingForGesture = "waiting",
    Ready = "ready",
}

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
let menu: Menu | null = null;
let menuMode: MainMenuMode = MainMenuMode.Loading;

function applyMenuMode() {
    if (!menu) return;

    if (menuMode !== MainMenuMode.Ready) {
        menu.hide();
    }
    else {
        menu.show();
    }
}

function drawModeOverlay(ctx: CanvasRenderingContext2D) {
    if (menuMode === MainMenuMode.Ready) return;

    const message = menuMode === MainMenuMode.Loading ? "LOADING..." : "CLICK TO START";

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
    ctx.lineWidth = 4;
    ctx.font = `50px ${Config.typography.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.restore();
}

export function setMainMenuMode(nextMode: MainMenuMode) {
    menuMode = nextMode;
    applyMenuMode();
}

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

    drawModeOverlay(ctx);
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

    menu = new Menu("MAIN MENU");
    const mainMenu = menu;
    applyMenuMode();

    const playerNameDialog = new UIDialog(400, 150);

    const okHandler = () => {
        try {
            Player.PL1.setName(nameInput.value);
            playerItem.text = "PLAYER: " + Player.PL1.name;
            playerNameDialog.hide();
            mainMenu.show();
        }
        catch {
            playerNameDialog.error = true;
            playerNameDialog.title = "INVALID NAME";
        }
    };

    const cancelHandler = () => {
        playerNameDialog.hide();
        mainMenu.show();
    };

    const nameInput = playerNameDialog.addTextInput(Player.PL1.name);
    nameInput.maxLength = 8;
    nameInput.addEventListener("enter", okHandler);
    nameInput.addEventListener("escape", cancelHandler);

    const playerItem = mainMenu.addItem("PLAYER: " + Player.PL1.name);

    playerItem.addEventListener("click", () => {
        nameInput.value = Player.PL1.name;
        playerNameDialog.error = false;
        playerNameDialog.title = "ENTER PLAYER NAME";

        mainMenu.hide();
        playerNameDialog.show();

        setTimeout(() => { nameInput.focus(); }, 0);
    });

    mainMenu.addItem("SETTINGS").disabled = true;

    mainMenu.addItem("START GAME").addEventListener("click", () => {
        exitMainMenu();
        loadLevel(
            getQueryStringValue<number>("level", 1) - 1
        );
    });

    graphics.add(mainMenu);

    playerNameDialog.addButton("OK").addEventListener("click", okHandler);
    playerNameDialog.addButton("CANCEL").addEventListener("click", cancelHandler);
    playerNameDialog.visible = false;
    graphics.add(playerNameDialog);

    game = new Game(update, draw, viewport);

    game.start();
}

export function exitMainMenu() {
    game.stop();
}
