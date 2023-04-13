import { clamp } from "../src/helpers";

describe("clamp", () => {
    test("clamp(0, 1, 2) => 1", () => expect(clamp(0, 1, 2)).toBe(1));
    test("clamp(1, 1, 2) => 1", () => expect(clamp(1, 1, 2)).toBe(1));
    test("clamp(2, 1, 2) => 2", () => expect(clamp(2, 1, 2)).toBe(2));
    test("clamp(3, 1, 2) => 2", () => expect(clamp(3, 1, 2)).toBe(2));
});
