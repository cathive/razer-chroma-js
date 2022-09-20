import { VersionInfo } from "./VersionInfo";
import { Device } from "./Device";
import { ErrorCode } from "./ErrorCode";
import { InitializationRequestData } from "./InitializationRequestData";
import { InitializationResponseData } from "./InitializationResponseData";
import { Effect } from "./Effect";
import { HeartbeatResponseData } from "./HeartbeatResponseData";
import { fetchWithTimeout } from "./helpers";
import { CreateEffectRequestData } from "./CreateEffectRequestData";
import { CreateEffectResponseData } from "./CreateEffectResponseData";

/* Created with a little helper script:
function create2dArrDef(rows, cols) {
  process.stdout.write(`type NUM_ARRAY_${rows}_BY_${cols} = [\n`);
 for (let r = 1; r <= rows; r++) {
    process.stdout.write('    [');
    for (let c = 1; c <= cols; c++) {
        process.stdout.write(`r${r}c${c}: number, `);
    }
    process.stdout.write('],\n');
  }
  process.stdout.write('];\n');
}
*/

type NUM_ARRAY_6_BY_22 = [
    [r1c1: number, r1c2: number, r1c3: number, r1c4: number, r1c5: number, r1c6: number, r1c7: number, r1c8: number, r1c9: number, r1c10: number, r1c11: number, r1c12: number, r1c13: number, r1c14: number, r1c15: number, r1c16: number, r1c17: number, r1c18: number, r1c19: number, r1c20: number, r1c21: number, r1c22: number ],
    [r2c1: number, r2c2: number, r2c3: number, r2c4: number, r2c5: number, r2c6: number, r2c7: number, r2c8: number, r2c9: number, r2c10: number, r2c11: number, r2c12: number, r2c13: number, r2c14: number, r2c15: number, r2c16: number, r2c17: number, r2c18: number, r2c19: number, r2c20: number, r2c21: number, r2c22: number ],
    [r3c1: number, r3c2: number, r3c3: number, r3c4: number, r3c5: number, r3c6: number, r3c7: number, r3c8: number, r3c9: number, r3c10: number, r3c11: number, r3c12: number, r3c13: number, r3c14: number, r3c15: number, r3c16: number, r3c17: number, r3c18: number, r3c19: number, r3c20: number, r3c21: number, r3c22: number ],
    [r4c1: number, r4c2: number, r4c3: number, r4c4: number, r4c5: number, r4c6: number, r4c7: number, r4c8: number, r4c9: number, r4c10: number, r4c11: number, r4c12: number, r4c13: number, r4c14: number, r4c15: number, r4c16: number, r4c17: number, r4c18: number, r4c19: number, r4c20: number, r4c21: number, r4c22: number ],
    [r5c1: number, r5c2: number, r5c3: number, r5c4: number, r5c5: number, r5c6: number, r5c7: number, r5c8: number, r5c9: number, r5c10: number, r5c11: number, r5c12: number, r5c13: number, r5c14: number, r5c15: number, r5c16: number, r5c17: number, r5c18: number, r5c19: number, r5c20: number, r5c21: number, r5c22: number ],
    [r6c1: number, r6c2: number, r6c3: number, r6c4: number, r6c5: number, r6c6: number, r6c7: number, r6c8: number, r6c9: number, r6c10: number, r6c11: number, r6c12: number, r6c13: number, r6c14: number, r6c15: number, r6c16: number, r6c17: number, r6c18: number, r6c19: number, r6c20: number, r6c21: number, r6c22: number ]
];

type NUM_ARRAY_9_BY_7 = [
    [r1c1: number, r1c2: number, r1c3: number, r1c4: number, r1c5: number, r1c6: number, r1c7: number ],
    [r2c1: number, r2c2: number, r2c3: number, r2c4: number, r2c5: number, r2c6: number, r2c7: number ],
    [r3c1: number, r3c2: number, r3c3: number, r3c4: number, r3c5: number, r3c6: number, r3c7: number ],
    [r4c1: number, r4c2: number, r4c3: number, r4c4: number, r4c5: number, r4c6: number, r4c7: number ],
    [r5c1: number, r5c2: number, r5c3: number, r5c4: number, r5c5: number, r5c6: number, r5c7: number ],
    [r6c1: number, r6c2: number, r6c3: number, r6c4: number, r6c5: number, r6c6: number, r6c7: number ],
    [r7c1: number, r7c2: number, r7c3: number, r7c4: number, r7c5: number, r7c6: number, r7c7: number ],
    [r8c1: number, r8c2: number, r8c3: number, r8c4: number, r8c5: number, r8c6: number, r8c7: number ],
    [r9c1: number, r9c2: number, r9c3: number, r9c4: number, r9c5: number, r9c6: number, r9c7: number ]
];

type NUM_ARRAY_1_BY_20 = [
    [r1c1: number, r1c2: number, r1c3: number, r1c4: number, r1c5: number, r1c6: number, r1c7: number, r1c8: number, r1c9: number, r1c10: number, r1c11: number, r1c12: number, r1c13: number, r1c14: number, r1c15: number, r1c16: number, r1c17: number, r1c18: number, r1c19: number, r1c20: number ]
];

type NUM_ARRAY_1_BY_5 = [
    [r1c1: number, r1c2: number, r1c3: number, r1c4: number, r1c5: number ]
];

type NUM_ARRAY_4_BY_5 = [
    [r1c1: number, r1c2: number, r1c3: number, r1c4: number, r1c5: number ],
    [r2c1: number, r2c2: number, r2c3: number, r2c4: number, r2c5: number ],
    [r3c1: number, r3c2: number, r3c3: number, r3c4: number, r3c5: number ],
    [r4c1: number, r4c2: number, r4c3: number, r4c4: number, r4c5: number ]

];

type NUM_ARRAY_8_BY_24 = [
    [r1c1: number, r1c2: number, r1c3: number, r1c4: number, r1c5: number, r1c6: number, r1c7: number, r1c8: number, r1c9: number, r1c10: number, r1c11: number, r1c12: number, r1c13: number, r1c14: number, r1c15: number, r1c16: number, r1c17: number, r1c18: number, r1c19: number, r1c20: number, r1c21: number, r1c22: number, r1c23: number, r1c24: number ],
    [r2c1: number, r2c2: number, r2c3: number, r2c4: number, r2c5: number, r2c6: number, r2c7: number, r2c8: number, r2c9: number, r2c10: number, r2c11: number, r2c12: number, r2c13: number, r2c14: number, r2c15: number, r2c16: number, r2c17: number, r2c18: number, r2c19: number, r2c20: number, r2c21: number, r2c22: number, r2c23: number, r2c24: number ],
    [r3c1: number, r3c2: number, r3c3: number, r3c4: number, r3c5: number, r3c6: number, r3c7: number, r3c8: number, r3c9: number, r3c10: number, r3c11: number, r3c12: number, r3c13: number, r3c14: number, r3c15: number, r3c16: number, r3c17: number, r3c18: number, r3c19: number, r3c20: number, r3c21: number, r3c22: number, r3c23: number, r3c24: number ],
    [r4c1: number, r4c2: number, r4c3: number, r4c4: number, r4c5: number, r4c6: number, r4c7: number, r4c8: number, r4c9: number, r4c10: number, r4c11: number, r4c12: number, r4c13: number, r4c14: number, r4c15: number, r4c16: number, r4c17: number, r4c18: number, r4c19: number, r4c20: number, r4c21: number, r4c22: number, r4c23: number, r4c24: number ],
    [r5c1: number, r5c2: number, r5c3: number, r5c4: number, r5c5: number, r5c6: number, r5c7: number, r5c8: number, r5c9: number, r5c10: number, r5c11: number, r5c12: number, r5c13: number, r5c14: number, r5c15: number, r5c16: number, r5c17: number, r5c18: number, r5c19: number, r5c20: number, r5c21: number, r5c22: number, r5c23: number, r5c24: number ],
    [r6c1: number, r6c2: number, r6c3: number, r6c4: number, r6c5: number, r6c6: number, r6c7: number, r6c8: number, r6c9: number, r6c10: number, r6c11: number, r6c12: number, r6c13: number, r6c14: number, r6c15: number, r6c16: number, r6c17: number, r6c18: number, r6c19: number, r6c20: number, r6c21: number, r6c22: number, r6c23: number, r6c24: number ],
    [r7c1: number, r7c2: number, r7c3: number, r7c4: number, r7c5: number, r7c6: number, r7c7: number, r7c8: number, r7c9: number, r7c10: number, r7c11: number, r7c12: number, r7c13: number, r7c14: number, r7c15: number, r7c16: number, r7c17: number, r7c18: number, r7c19: number, r7c20: number, r7c21: number, r7c22: number, r7c23: number, r7c24: number ],
    [r8c1: number, r8c2: number, r8c3: number, r8c4: number, r8c5: number, r8c6: number, r8c7: number, r8c8: number, r8c9: number, r8c10: number, r8c11: number, r8c12: number, r8c13: number, r8c14: number, r8c15: number, r8c16: number, r8c17: number, r8c18: number, r8c19: number, r8c20: number, r8c21: number, r8c22: number, r8c23: number, r8c24: number ]
];

export { Device } from "./Device";
export { Effect } from "./Effect";
export { Category } from "./Category";
export { ErrorCode } from "./ErrorCode";

export const ALL_DEVICES = [
    Device.KEYBOARD,
    Device.MOUSE,
    Device.HEADSET,
    Device.MOUSEPAD,
    Device.KEYPAD,
    Device.CHROMALINK
];

function validateInitData(initData: InitializationRequestData): void {
    if (initData == null) {
        throw new Error("Initialization data missing.");
    }
    if (initData.title == null || initData.title.length > 64) {
        throw new Error("initData.title missing or longer than 64 chars.");
    }
    if (initData.description == null || initData.description.length > 256) {
        throw new Error("initData.description missing or longer than 256 chars.");
    }
    if (initData.author == null) {
        throw new Error("initData.author missing.");
    }
    if (initData.author.name == null || initData.author.name.length > 64) {
        throw new Error("initData.author.name missing or lengths longer than 64 chars.");
    }
    if (initData.author.contact == null || initData.author.contact.length > 64) {
        throw new Error("initData.author.contact missing or longer than 64 chars.");
    }
    if (initData.device_supported == null || initData.device_supported.length <= 0) {
        throw new Error("initData.device_supported is missing or contains no entries.");
    }
    if (initData.category == null) {
        throw new Error(`initData.category is missing.`)
    }
}



interface RazerChromaSDKInitArgs {
    readonly sessionId: number;
    readonly uri: string;
}

interface SetSingleEffectRequest {
    id: string;
}

interface SetMultipleEffectsRequest {
    ids: string[];
}

interface SetSingleEffectResponse {
    result: ErrorCode;
}

interface SetMultipleEffectsResponse {
    results: SetSingleEffectResponse[];
}

interface DeleteSingleEffectRequest {
    id: string;
}

interface DeleteMultipleEffectsRequest {
    ids: string[];
}

interface DeleteSingleEffectResponse {
    result: ErrorCode;
}

interface DeleteMultipleEffectsResponse {
    results: DeleteSingleEffectResponse[];
}

export class RazerChromaSDK {

    /** URI of the Chroma SDK RESTful server */
    static #initUri: string = "http://localhost:54235/razer/chromasdk";

    /** Heartbeat interval in milliseconds. */
    static heartbeatInterval: number = 3000;

    /**
     * Returns the current Chroma SDK version that is present in the system.
     * @returns
     *   the current Chroma SDK version that is present in the system.
     */
    static async getVersionInfo(uri: string = RazerChromaSDK.#initUri): Promise<VersionInfo> {
        const responseData: VersionInfo = await fetchWithTimeout(uri, {
            method: "GET"
        });
        return responseData;
    }

    static async initialize(initData: InitializationRequestData, uri: string = RazerChromaSDK.#initUri): Promise<RazerChromaSDK> {
        validateInitData(initData);
        const responseData: InitializationResponseData = await fetchWithTimeout(uri, {
            method: "POST",
            body: JSON.stringify(initData)
        });
        if (responseData.result != null && responseData.result !== ErrorCode.SUCCESS) {
            throw new Error(`Initialization of Razer Chrome SDK failed: ${responseData.result}`);
        }
        return new RazerChromaSDK({ sessionId: responseData.sessionid!, uri: responseData.uri! })
    }

    #sessionId: number | null;
    #uri: string;
    #heartbeat: {
        handle: number,
        fn: () => Promise<void>
    }
    #tick: number;

    #effects: Effects;

    private constructor(initArgs: RazerChromaSDKInitArgs) {
        if (initArgs == null || initArgs.sessionId == null || initArgs.uri == null) {
            throw new Error(`Invalid initialization arguments. Did you correctly call RazerChromaSDK.initialize() to obtain a new client instance?`)
        }
        this.#sessionId = initArgs.sessionId;
        this.#uri = initArgs.uri;
        this.#heartbeat = {
            handle: NaN,
            fn: async () => {
                try {
                    const responseData: HeartbeatResponseData = await fetchWithTimeout(`${this.#uri}/heartbeat`, {
                        method: "PUT"
                    });
                    this.#tick = responseData.tick;
                } catch (e) {
                    console.log(e);
                }
            }
        }
        this.#tick = NaN;
        this.#effects = new Effects(this);
        this.#heartbeat.handle = setInterval(this.#heartbeat.fn.bind(this), RazerChromaSDK.heartbeatInterval, this.uri);

    }
    public get uri() {
        return this.#uri;
    }
    public get sessionId() {
        return this.#sessionId;
    }
    protected get tick() {
        return this.#tick;
    }
    public toString() {
        return `ChromaSDK <Session ID: #${this.#sessionId || "None"}>`
    }
    public async uninitialize() {
        if (this.#heartbeat != null && this.#heartbeat.handle != null) {
            clearInterval(this.#heartbeat.handle);
            this.#heartbeat.handle = NaN;
        }
        await fetchWithTimeout(this.#uri, {
            method: "DELETE"
        }).catch();
        this.#sessionId = null;
        this.#tick = -1;
    }

    get effects() { return this.#effects; }
}

class Effects {

    #effects: Map<string, any>;
    #sdk: RazerChromaSDK;

    constructor(sdk: RazerChromaSDK) {
        this.#effects = new Map();
        this.#sdk = sdk
    }

    //#region Effects on keyboards, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_03_8keyboard.html
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.STATIC, param: { color: number } }): Promise<string>;
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.CUSTOM2, param: { color: NUM_ARRAY_8_BY_24, key: NUM_ARRAY_6_BY_22 } }): Promise<string>;
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_6_BY_22 }): Promise<string>;
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.CUSTOM_KEY, param: { color: NUM_ARRAY_6_BY_22, key: NUM_ARRAY_6_BY_22 } }): Promise<string>;
    //#endregion

    //#region Effects on mice, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_04_8mouse.html
    public async create(device: Device.MOUSE, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.MOUSE, effect: { effect: Effect.STATIC, param: { color: number } }): Promise<string>;
    public async create(device: Device.MOUSE, effect: { effect: Effect.CUSTOM2, param: NUM_ARRAY_9_BY_7 }): Promise<string>;
    //#endregion

    //#region Effects on mousepads, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_05_8mousemat.html
    public async create(device: Device.MOUSEPAD, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.MOUSEPAD, effect: { effect: Effect.STATIC, param: { color: number } }): Promise<string>;
    public async create(device: Device.MOUSEPAD, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_1_BY_20 }): Promise<string>;
    //#endregion

    //#region Effects on headsets, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_06_8headset.html
    public async create(device: Device.HEADSET, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.HEADSET, effect: { effect: Effect.STATIC, param: { color: number } }): Promise<string>;
    public async create(device: Device.HEADSET, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_1_BY_5 }): Promise<string>;
    //#endregion

    //#region Effects on headsets, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_06_8headset.html
    public async create(device: Device.KEYPAD, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.KEYPAD, effect: { effect: Effect.STATIC, param: { color: number } }): Promise<string>;
    public async create(device: Device.KEYPAD, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_4_BY_5 }): Promise<string>;
    //#endregion

    //#region Effects on Chroma Linked Devices, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_08_8chromalink.html
    public async create(device: Device.CHROMALINK, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.CHROMALINK, effect: { effect: Effect.STATIC, param: { color: number } }): Promise<string>;
    public async create(device: Device.CHROMALINK, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_1_BY_5 }): Promise<string>;
    //#endregion

    public async create(device: Device, effect: CreateEffectRequestData): Promise<string> {
        const responseData: CreateEffectResponseData = await fetchWithTimeout(`${this.#sdk.uri}/${device}`, {
            method: "POST",
            body: JSON.stringify(effect)
        }, 5000);
        if (responseData.result === 0) {
            this.#effects.set(responseData.id, effect.effect);
            return responseData.id;
        }
        throw new Error(`Creation of effect failed. Error code: ${responseData.result}`);

    }

    public async set(id: string): Promise<ErrorCode>;
    public async set(ids: string[]): Promise<ErrorCode[]>;
    async set(idOrIds: string | string[]): Promise<ErrorCode | ErrorCode[]> {
        if (typeof idOrIds === "string") {
            const request: SetSingleEffectRequest = {
                id: idOrIds
            }
            const responseData: SetSingleEffectResponse = await fetchWithTimeout(`${this.#sdk.uri}/effect`, {
                method: "PUT",
                body: JSON.stringify(request)
            });
            return responseData.result;
        } else if (Array.isArray(idOrIds)) {
            const request: SetMultipleEffectsRequest = {
                ids: idOrIds
            }
            const responseData: SetMultipleEffectsResponse = await fetchWithTimeout(`${this.#sdk.uri}/effect`, {
                method: "PUT",
                body: JSON.stringify(request)
            });
            return responseData.results.map(result => result.result);
        } else {
            throw new Error(`Unexpected parameter type: ${typeof idOrIds}`);
        }
    }

    public async delete(id: string): Promise<ErrorCode>;
    public async delete(ids: string[]): Promise<ErrorCode[]>;
    async delete(idOrIds: string | string[]): Promise<ErrorCode | ErrorCode[]> {
        if (typeof idOrIds === "string") {
            const request: DeleteSingleEffectRequest = {
                id: idOrIds
            }
            const responseData: DeleteSingleEffectResponse = await fetchWithTimeout(`${this.#sdk.uri}/effect`, {
                method: "DELETE",
                body: JSON.stringify(request)
            });
            if (responseData.result === 0) {
                this.#effects.delete(idOrIds);
            }
            return responseData.result;
        } else if (Array.isArray(idOrIds)) {
            const request: SetMultipleEffectsRequest = {
                ids: idOrIds
            }
            const responseData: SetMultipleEffectsResponse = await fetchWithTimeout(`${this.#sdk.uri}/effect`, {
                method: "PUT",
                body: JSON.stringify(request)
            });
            return responseData.results.map(result => result.result);
        } else {
            throw new Error(`Unexpected parameter type: ${typeof idOrIds}`);
        }
    }

}
