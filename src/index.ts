import Game from './Game';
import Ship from './Ship';
import Vector from './Physics/Vector';
import Camera from './Graphics/Camera';
import { Hud } from './Hud';
import Keys from './Controls/Keys';
import Cosmos from './Cosmos';
import ShipController from './ShipController';
import Fuel from './Fuel';
import PhysicsEngine from './Physics/PhysicsEngine';
import { Graphics } from './Graphics/Graphics';
import Pointer from './Controls/Pointer';
import { VacuumOfSpace } from './Physics/Environment';

let debugMode = false;

let physics = new PhysicsEngine(VacuumOfSpace);
let graphics = new Graphics();

graphics.add(new Cosmos());

const camera = new Camera(Vector.Zero, 3);
const game = new Game(update, draw, camera);

const ship = new Ship(Vector.Zero);
ship.mass = 800;
physics.add(ship);
graphics.add(ship);

let fuelCapsule: Fuel = generateRandomFuelCapsule();

const hud = new Hud(ship, fuelCapsule);
//hud.items.push(() => `Altitude: ${ship.pos.y.toFixed(0)} m`);
hud.add(() => `Velocity: ${ship.v.length().toFixed(1)} m/s`);
hud.add(() => `Thrusters: ${getThrusterStatus(ship)}`);
hud.add(() => `Fuel: ${(ship.fuelTank.currentAmount / ship.fuelTank.capacity * 100).toFixed()}% (${ship.fuelTank.currentAmount.toFixed()} kg)`);
hud.add(() => `Physics: ${physics.count}`, () => debugMode);
hud.add(() => `Graphics: ${graphics.count}`, () => debugMode);

hud.add(() => {
    const screen = Pointer.getPosition();
    const world = camera.toWorldCoordinates(game.ctx, screen);
    return `Mouse: ${screen} (screen) ${world} (world)`;
}, () => debugMode);

graphics.add(hud);

game.every(1, () => {
    physics.cleanUp();
    graphics.cleanUp();
});

game.start();

let shipController = new ShipController(ship);

function update(time: number, delta: number) {
    if (debugButton()) {
        debugMode = !debugMode;
    }

    shipController.control();

    if (fire() && ship.alive) {
        ship.fire();
    }

    physics.update(time, delta);

    if (fuelCapsule.pos.sub(ship.pos).length() < 8) {
        fuelCapsule.collect(ship);
        hud.fuelCapsule = generateRandomFuelCapsule();
    }

    panTowardsShip(delta);
}

function draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ctx.save();
    ctx.transform(1, 0, 0, -1, 0, ctx.canvas.height)

    graphics.draw(ctx, camera);
    
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
const debugButton = () => Keys.wasPressed(68);

function generateRandomFuelCapsule(): Fuel {
    const distance = 100 + Math.random() * 200;
    const angle = Math.random() * Math.PI * 2;

    fuelCapsule = new Fuel(ship.pos.add(Vector.Up.mul(distance).rotate(angle)));
    fuelCapsule.angularVelocity = Math.random() - 0.5;
    physics.add(fuelCapsule);
    graphics.add(fuelCapsule);

    return fuelCapsule;
}