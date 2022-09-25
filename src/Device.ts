export type Device = "keyboard"
                   | "mouse"
                   | "headset"
                   | "mousepad"
                   | "keypad"
                   | "chromalink";

export namespace Device {
    export const KEYBOARD: Device = "keyboard";
    export const MOUSE: Device = "mouse";
    export const HEADSET: Device = "headset";
    export const MOUSEPAD: Device = "mousepad";
    export const KEYPAD: Device = "keypad";
    export const CHROMALINK: Device = "chromalink";
}
Object.freeze(Device);
