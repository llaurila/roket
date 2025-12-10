import { expect, test } from 'vitest';
import AutoPilot from './AutoPilot';
import Ship from '../Ship';
import Vector from '../Physics/Vector';
import { IShip } from '@/Ship/types';

const ship: IShip = new Ship(Vector.Zero);
const ap = new AutoPilot(ship);
const target = new Vector(20, 10);

test('setTarget', () => {
    ap.setTarget(target);
    const v = ap.getVectorToTarget();
    expect(v.x).toBe(20);
    expect(v.y).toBe(10);
});

test('getVectorToTarget', () => {
    ap.setTarget(target);
    const vectorToTarget = ap.getVectorToTarget();
    expect(vectorToTarget.x).toBe(20);
    expect(vectorToTarget.y).toBe(10);
});

test('getAngleToTarget', () => {
    ap.setTarget(target);
    const angle = ap.getAngleToTarget();
    expect(angle).toBeCloseTo(-.894, 3);
});

test('getSpeedToTarget', () => {
    ap.setTarget(target);
    const speed = ap.getSpeedToTarget();
    expect(speed).toBe(0);
});

test('control', () => {
    ap.control();
    expect(true).toBe(true);
});
