import { Color } from "../src/Color";

describe("Static colors (BGR values)", () => {
    test("Red", () => expect(Color.RED.toBGR()).toBe(255));
    test("Green", () => expect(Color.GREEN.toBGR()).toBe(65280));
    test("Blue", () => expect(Color.BLUE.toBGR()).toBe(16711680));
});

describe("Custom colors", () => {
    test("Red", () => expect(new Color("#ff0000").toBGR()).toEqual(Color.RED.toBGR()));
    test("Green", () => expect(new Color("#00ff00").toBGR()).toEqual(Color.GREEN.toBGR()));
    test("Blue", () => expect(new Color("#0000ff").toBGR()).toEqual(Color.BLUE.toBGR()));
});
