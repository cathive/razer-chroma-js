import { VersionInfo } from "./VersionInfo";
import { Device } from "./Device";
import { ErrorCode } from "./ErrorCode";
import { InitializationRequestData } from "./InitializationRequestData";
import { InitializationResponseData } from "./InitializationResponseData";
import { Color } from "./Color";
import { Effect } from "./Effect";
import { HeartbeatResponseData } from "./HeartbeatResponseData";
import { fetchWithTimeout } from "./helpers";
import { CreateEffectRequestData } from "./CreateEffectRequestData";
import { CreateEffectResponseData } from "./CreateEffectResponseData";
import { NUM_ARRAY_6_BY_22, NUM_ARRAY_9_BY_7, NUM_ARRAY_1_BY_20, NUM_ARRAY_1_BY_5, NUM_ARRAY_4_BY_5, NUM_ARRAY_8_BY_24} from "./arrays";

export { Device } from "./Device";
export { Color } from "./Color";
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

    #created: Map<string, any>;
    #sdk: RazerChromaSDK;

    constructor(sdk: RazerChromaSDK) {
        this.#created = new Map();
        this.#sdk = sdk
    }

    public get created(): Map<string, any> {
        return this.#created;
    }

    //#region Effects on keyboards, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_03_8keyboard.html
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.CUSTOM2, param: { color: NUM_ARRAY_8_BY_24, key: NUM_ARRAY_6_BY_22 } }): Promise<string>;
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_6_BY_22 }): Promise<string>;
    public async create(device: Device.KEYBOARD, effect: { effect: Effect.CUSTOM_KEY, param: { color: NUM_ARRAY_6_BY_22, key: NUM_ARRAY_6_BY_22 } }): Promise<string>;
    //#endregion

    //#region Effects on mice, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_04_8mouse.html
    public async create(device: Device.MOUSE, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.MOUSE, effect: { effect: Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: Device.MOUSE, effect: { effect: Effect.CUSTOM2, param: NUM_ARRAY_9_BY_7 }): Promise<string>;
    //#endregion

    //#region Effects on mousepads, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_05_8mousemat.html
    public async create(device: Device.MOUSEPAD, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.MOUSEPAD, effect: { effect: Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: Device.MOUSEPAD, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_1_BY_20 }): Promise<string>;
    //#endregion

    //#region Effects on headsets, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_06_8headset.html
    public async create(device: Device.HEADSET, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.HEADSET, effect: { effect: Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: Device.HEADSET, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_1_BY_5 }): Promise<string>;
    //#endregion

    //#region Effects on headsets, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_06_8headset.html
    public async create(device: Device.KEYPAD, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.KEYPAD, effect: { effect: Effect.STATIC, param: { color: number } }): Promise<string>;
    public async create(device: Device.KEYPAD, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_4_BY_5 }): Promise<string>;
    //#endregion

    //#region Effects on Chroma Linked Devices, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_08_8chromalink.html
    public async create(device: Device.CHROMALINK, effect: { effect: Effect.NONE }): Promise<string>;
    public async create(device: Device.CHROMALINK, effect: { effect: Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: Device.CHROMALINK, effect: { effect: Effect.CUSTOM, param: NUM_ARRAY_1_BY_5 }): Promise<string>;
    //#endregion

    public async create(device: Device, effect: CreateEffectRequestData): Promise<string> {
        const responseData: CreateEffectResponseData = await fetchWithTimeout(`${this.#sdk.uri}/${device}`, {
            method: "POST",
            body: JSON.stringify(effect)
        }, 5000);
        if (responseData.result === 0) {
            this.#created.set(responseData.id, effect.effect);
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
            if (responseData.result === ErrorCode.SUCCESS) {
                this.#created.delete(idOrIds);
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
            responseData.results.forEach((result, index) => {
                if (result.result == ErrorCode.SUCCESS) {
                    this.#created.delete(idOrIds[index]);
                }
            });
            return responseData.results.map(result => result.result);
        } else {
            throw new Error(`Unexpected parameter type: ${typeof idOrIds}`);
        }
    }

}
