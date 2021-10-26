import Vector from "./Vector";

describe("Vector()", () => {
    it("initializes the fields", () => {
        const v = new Vector(1, 2);
        expect(v.x).toEqual(1);
        expect(v.y).toEqual(2);
    });
});
