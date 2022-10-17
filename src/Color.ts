import { clamp } from "./helpers";

const BGR_REGEXP: RegExp = /^#?(?<red>[a-f\d]{2})(?<green>[a-f\d]{2})(?<blue>[a-f\d]{2})$/i;

export class Color {

    static readonly #BLACK: Color = new Color("#000000");
    public static get BLACK() {
        return Color.#BLACK;
    }

    static readonly #WHITE: Color = new Color(255, 255, 255);
    public static get WHITE() {
        return Color.#WHITE;
    }

    static readonly #RED: Color = new Color("#ff0000");
    public static get RED() {
        return Color.#RED;
    }

    static readonly #GREEN: Color = new Color("#00ff00");
    public static get GREEN() {
        return Color.#GREEN;
    }

    static readonly #BLUE: Color = new Color("#0000ff");
    public static get BLUE() {
        return Color.#BLUE;
    }

    static readonly #ORANGE: Color = new Color("#ffa500");
    public static get ORANGE() {
        return Color.#ORANGE;
    }

    static readonly #PINK: Color = new Color("#ff00ff");
    public static get PINK() {
        return Color.#PINK;
    }

    static readonly #PURPLE: Color = new Color("#800080");
    public static get PURPLE() {
        return Color.#PURPLE;
    }

    static readonly #YELLOW: Color = new Color(255, 255, 0);
    public static get YELLOW() {
        return Color.#YELLOW;
    }

    #red: number;
    public get red(): number { return this.#red; }

    #green: number;
    public get green(): number { return this.#green; }

    #blue: number;
    public get blue(): number { return this.#blue; }

    #isKey: boolean = false;
    public get isKey(): boolean { return this.#isKey; }

    constructor(str: string);
    constructor(rgb: number);
    constructor(red: number, green: number, blue: number);
    constructor(redOrString: number | string, green?: number, blue?: number) {
        if (green == null && blue == null && redOrString !== null) {
            if (typeof redOrString === "string") {
                const result: RegExpExecArray | null = BGR_REGEXP.exec(redOrString);
                if (result == null || result.groups == null || result.groups.red == null || result.groups.green == null || result.groups.blue == null) {
                    throw new Error(`Unable to parse color string: ${redOrString}`);
                }
                this.#red = parseInt(result.groups.red, 16);
                this.#green = parseInt(result.groups.green, 16);
                this.#blue = parseInt(result.groups.blue, 16);
            } else {
                this.#blue = (redOrString >> 16) & 0xff; // tslint:disable-line:no-bitwise
                this.#green = (redOrString >> 8) & 0xff; // tslint:disable-line:no-bitwise
                this.#red = (redOrString >> 0) & 0xff; // tslint:disable-line:no-bitwise
            }
        } else {
            this.#red = clamp(Math.round(redOrString as number), 0, 255);
            this.#green = clamp(Math.round(green!), 0, 255);
            this.#blue = clamp(Math.round(blue!), 0, 255);
        }
    }

    public toBGR() {
        let rHex = this.red.toString(16);
        if (rHex.length < 2) {
            rHex = `0${rHex}`;
        }
        let gHex = this.green.toString(16);
        if (gHex.length < 2) {
            gHex = `0${gHex}`;
        }
        let bHex = this.blue.toString(16);
        if (bHex.length < 2) {
            bHex = `0${bHex}`;
        }

        let result = `${bHex}${gHex}${rHex}`
        if (this.isKey) {
            result = `ff${result}`;
        }

        return parseInt(result, 16);
    }

    public toJSON() {
        return this.toBGR();
    }

    public toString() {
        return `Color(red:${this.red},green:${this.green},blue:${this.blue})`;
    }

}
Object.freeze(Color);
