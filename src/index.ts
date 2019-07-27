import Game from './Game';
import Ship from './Ship';
import Vector from './Vector';
import IUpdatable from './IUpdatable';
import Camera from './Camera';
import Hud from './Hud';
import Keys from './Keys';
import { CCW, CW } from './Utils';
import Cosmos from './Cosmos';
import IDrawable from './IDrawable';
import Pointer from './Pointer';

let updatables: IUpdatable[] = [];
let drawables: IDrawable[] = [];

drawables.push(new Cosmos());

const camera = new Camera(new Vector(30, 50), 3);
const game = new Game(update, draw, camera);

const ship = new Ship(new Vector(0, 0));
ship.mass = 800;

updatables.push(ship);
drawables.push(ship);

const hud = new Hud();
//hud.items.push(() => `Altitude: ${ship.pos.y.toFixed(0)} m`);
hud.items.push(() => `Velocity: ${ship.v.length().toFixed(1)} m/s`);
hud.items.push(() => `Thrusters: ${getThrusterStatus(ship)}`);
hud.items.push(() => `Fuel: ${(ship.fuelTank.currentAmount / ship.fuelTank.capacity * 100).toFixed()}% (${ship.fuelTank.currentAmount.toFixed()} kg)`);

hud.items.push(() => {
    const screen = Pointer.getPosition();
    const world = camera.toWorldCoordinates(game.ctx, screen);
    return `Mouse: ${screen} (screen) ${world} (world)`;
});

game.start();

function update(time: number, delta: number) {
    ship.engineLeft.burning = cw();
    ship.engineRight.burning = ccw();
    
    if (!ship.engineLeft.burning && !ship.engineRight.burning && burning())
    {
        ship.engineLeft.burning = true;
        ship.engineRight.burning = true;
    }

    for (let updatable of updatables) {
        updatable.update(time, delta);
    }

    if (zoomIn()) {
        camera.zoom *= 1 + delta;
        panTowardsShip(delta);
    }
    else if (zoomOut()) {
        camera.zoom *= 1 - delta;
        panTowardsShip(delta);
    }
}

function draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    drawObjects(ctx, camera);
    hud.draw(ctx, camera);
}

function drawObjects(ctx: CanvasRenderingContext2D, camera: Camera): void {
    ctx.save();
    ctx.transform(1, 0, 0, -1, 0, ctx.canvas.height)

    for (let drawable of drawables) {
        drawable.draw(ctx, camera);
    }
    
    ctx.restore();
}

function panTowardsShip(delta: number): void {
    let toShip = ship.pos.sub(camera.pos);
    if (toShip.length() > 0)
    {
        camera.pos = camera.pos.add(toShip.mul(delta));
    }
}

function getThrusterStatus(ship: Ship): string {
    let status = '';
    if (ship.engineLeft.burning) {
        status += 'LEFT';
    }
    if (ship.engineRight.burning) {
        status += ' RIGHT';
    }
    if (status.length == 0) {
        return "OFF";
    }
    return status.trim();
}

const burning = () => Keys.isPressed(38);
const ccw = () => Keys.isPressed(37);
const cw = () => Keys.isPressed(39);
const zoomIn = () => Keys.isPressed(107) || Keys.isPressed(81);
const zoomOut = () => Keys.isPressed(109) || Keys.isPressed(65);