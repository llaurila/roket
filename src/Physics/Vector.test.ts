/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import Vector from "./Vector.ts";

test("Vector.add adds components", () => {
  const v1 = new Vector(1, 2);
  const v2 = new Vector(3, 4);
  const result = v1.add(v2);
  expect(result.x).toBe(4);
  expect(result.y).toBe(6);
});

test("Vector.sub subtracts components", () => {
  const v1 = new Vector(5, 7);
  const v2 = new Vector(2, 3);
  const result = v1.sub(v2);
  expect(result.x).toBe(3);
  expect(result.y).toBe(4);
});

test("Vector.length returns Euclidean length", () => {
  const v = new Vector(3, 4);
  expect(v.length()).toBe(5);
});
