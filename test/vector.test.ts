import test from 'node:test';
import assert from 'node:assert/strict';
import Vector from '../src/Physics/Vector.ts';

test('Vector.add adds components', () => {
  const v1 = new Vector(1, 2);
  const v2 = new Vector(3, 4);
  const result = v1.add(v2);
  assert.equal(result.x, 4);
  assert.equal(result.y, 6);
});

test('Vector.sub subtracts components', () => {
  const v1 = new Vector(5, 7);
  const v2 = new Vector(2, 3);
  const result = v1.sub(v2);
  assert.equal(result.x, 3);
  assert.equal(result.y, 4);
});

test('Vector.length returns Euclidean length', () => {
  const v = new Vector(3, 4);
  assert.equal(v.length(), 5);
});
