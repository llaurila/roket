import Game from './Game';
import Ship from './Ship';
import Vector from './Vector';
import IUpdatable from './IUpdatable';
import Camera from './Camera';
import Hud from './Hud';
import Keys from './Keys';
import Cosmos from './Cosmos';
import IDrawable from './IDrawable';
import ShipController from './ShipController';
import Fuel from './Fuel';

let updatables: IUpdatable[] = [];
let drawables: IDrawable[] = [];

drawables.push(new Cosmos());

const camera = new Camera(Vector.Zero, 3);
const game = new Game(update, draw, camera);

const ship = new Ship(Vector.Zero);
ship.mass = 800;
updatables.push(ship);
drawables.push(ship);

let fuelCapsule: Fuel;
generateFuelCapsule();

const hud = new Hud();
//hud.items.push(() => `Altitude: ${ship.pos.y.toFixed(0)} m`);
hud.items.push(() => `Velocity: ${ship.v.length().toFixed(1)} m/s`);
hud.items.push(() => `Thrusters: ${getThrusterStatus(ship)}`);
hud.items.push(() => `Fuel: ${(ship.fuelTank.currentAmount / ship.fuelTank.capacity * 100).toFixed()}% (${ship.fuelTank.currentAmount.toFixed()} kg)`);

/*hud.items.push(() => {
    const screen = Pointer.getPosition();
    const world = camera.toWorldCoordinates(game.ctx, screen);
    return `Mouse: ${screen} (screen) ${world} (world)`;
});*/

game.start();

/*setInterval(() => {
    updatables = updatables.filter(x => x.alive);
    drawables = drawables.filter(x => x.alive);
}, 1000);*/

let shipController = new ShipController(ship);

function update(time: number, delta: number) {
    shipController.control();

    if (fire()) {
        const ammo = ship.fire();
        updatables.push(ammo);
        drawables.push(ammo);
    }

    for (let updatable of updatables) {
        updatable.update(time, delta);
    }

    if (fuelCapsule.pos.sub(ship.pos).length() < 8) {
        fuelCapsule.collect(ship);
        generateFuelCapsule();
    }

    panTowardsShip(delta);
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
    const v = ship.v.length();
    camera.zoom = 5 - Math.min(99, v) / 33;

    const target = ship.pos.add(
        ship.v.mul(2)
    );

    const towards = target.sub(camera.pos);

    if (towards.length() > 0)
    {
        camera.pos = camera.pos.add(towards.mul(delta));
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

const fire = () => Keys.wasPressed(32);

function generateFuelCapsule(): void {
    const distance = 25 + Math.random() * 50;
    const angle = Math.random() * Math.PI * 2;

    fuelCapsule = new Fuel(ship.pos.add(Vector.Up.mul(distance).rotate(angle)));
    fuelCapsule.angularVelocity = Math.random() - 0.5;
    updatables.push(fuelCapsule);
    drawables.push(fuelCapsule);
}