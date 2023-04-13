import { VersionInfo } from "./VersionInfo";
import { Device } from "./Device";
import { Effect } from "./Effect";
import { ErrorCode } from "./ErrorCode";
import { InitializationRequestData } from "./InitializationRequestData";
import { InitializationResponseData } from "./InitializationResponseData";
import { Color } from "./Color";
import { HeartbeatResponseData } from "./HeartbeatResponseData";
import { fetchWithTimeout, sleep } from "./helpers";
import { CreateEffectRequestData } from "./CreateEffectRequestData";
import { CreateEffectResponseData } from "./CreateEffectResponseData";
import { NUM_ARRAY_6_BY_22, NUM_ARRAY_9_BY_7, NUM_ARRAY_1_BY_20, NUM_ARRAY_1_BY_5, NUM_ARRAY_4_BY_5, NUM_ARRAY_8_BY_24} from "./arrays";

export { Device } from "./Device";
export { Color } from "./Color";
export { Effect } from "./Effect";
export { Category } from "./Category";
export { ErrorCode } from "./ErrorCode";

/**
 * Validates the initialization request data and throws an error if the data can't be used
 * to perform proper initialization. (Think of it as kind of a pre-flight check before we
 * actually bother the API with our possibly malformed request)
 * @param initData
 *   object to be validated
 * @throws
 *   If anything with the data is not quite right.
 */
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
    readonly uri: URL;
    readonly devices: {
        supported: Set<Device>
    };
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

    /**
     * URI of the Chroma SDK RESTful server
     * See: https://assets.razerzone.com/dev_portal/REST/html/index.html#uri
     */
    static #initUri: URL = new URL("http://localhost:54235/razer/chromasdk");

    /** Heartbeat interval in milliseconds. */
    public static heartbeatInterval: number = 3000;

    /**
     * Returns the current Chroma SDK version that is present in the system.
     * @returns
     *   the current Chroma SDK version that is present in the system.
     */
    public static async getVersionInfo(uri: string|URL = RazerChromaSDK.#initUri): Promise<VersionInfo> {
        const responseData: VersionInfo = await fetchWithTimeout(uri, {
            method: "GET"
        });
        return responseData;
    }

    static async initialize(initData: InitializationRequestData, uri: string|URL = RazerChromaSDK.#initUri): Promise<RazerChromaSDK> {
        validateInitData(initData);
        const responseData: InitializationResponseData = await fetchWithTimeout(uri, {
            method: "POST",
            body: JSON.stringify(initData)
        });
        if (responseData.result != null && responseData.result !== ErrorCode.SUCCESS) {
            throw new Error(`Initialization of Razer Chrome SDK failed: ${responseData.result}`);
        }
        const sdk = new RazerChromaSDK({
            sessionId: responseData.sessionid!,
            uri: new URL(responseData.uri!),
            devices: {
                supported: new Set(initData.device_supported)
            }
        });

        // Workaround: we are not fully operational for a few moments, which is pretty
        // hard to detect in a sane way for now.
        await sleep(1000);

        return sdk;
    }

    #sessionId: number | null;
    #uri: URL;
    #heartbeat: {
        handle: number,
        fn: () => Promise<unknown>
    }
    #tick: number;

    #effects: Effects;

    #devices: { supported: Set<Device> };
    public get devices() {
        return this.#devices;
    }

    private constructor(initArgs: RazerChromaSDKInitArgs) {
        if (initArgs == null || initArgs.sessionId == null || initArgs.uri == null) {
            throw new Error(`Invalid initialization arguments. Did you correctly call RazerChromaSDK.initialize() to obtain a new client instance?`)
        }

        this.#devices = initArgs.devices;
        Object.freeze(this.#devices);

        this.#sessionId = initArgs.sessionId;

        this.#uri = initArgs.uri;
        this.#heartbeat = {
            handle: NaN,
            fn: (async () => {
                try {
                    const responseData: HeartbeatResponseData = await fetchWithTimeout(`${this.#uri}/heartbeat`, {
                        method: "PUT"
                    });
                    this.#tick = responseData.tick;
                } catch (e: unknown) {
                    // TODO Propagate error? Call error handler? Notify someone?
                    console.error(`Heartbeat failed: ${e}`);
                    return e;
                }
            }).bind(this)
        };
        this.#tick = NaN;
        this.#effects = new Effects(this);

        this.#heartbeat.handle = setInterval(this.#heartbeat.fn, RazerChromaSDK.heartbeatInterval, this.uri);

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
        return `ChromaSDK <Session ID: #${this.#sessionId ?? "None"}>`
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
    public async create(device: typeof Device.KEYBOARD, effect: { effect: typeof Effect.NONE }): Promise<string>;
    public async create(device: typeof Device.KEYBOARD, effect: { effect: typeof Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: typeof Device.KEYBOARD, effect: { effect: typeof Effect.CUSTOM2, param: { color: NUM_ARRAY_8_BY_24, key: NUM_ARRAY_6_BY_22 } }): Promise<string>;
    public async create(device: typeof Device.KEYBOARD, effect: { effect: typeof Effect.CUSTOM, param: NUM_ARRAY_6_BY_22 }): Promise<string>;
    public async create(device: typeof Device.KEYBOARD, effect: { effect: typeof Effect.CUSTOM_KEY, param: { color: NUM_ARRAY_6_BY_22, key: NUM_ARRAY_6_BY_22 } }): Promise<string>;
    //#endregion

    //#region Effects on mice, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_04_8mouse.html
    public async create(device: typeof Device.MOUSE, effect: { effect: typeof Effect.NONE }): Promise<string>;
    public async create(device: typeof Device.MOUSE, effect: { effect: typeof Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: typeof Device.MOUSE, effect: { effect: typeof Effect.CUSTOM2, param: NUM_ARRAY_9_BY_7 }): Promise<string>;
    //#endregion

    //#region Effects on mousepads, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_05_8mousemat.html
    public async create(device: typeof Device.MOUSEPAD, effect: { effect: typeof Effect.NONE }): Promise<string>;
    public async create(device: typeof Device.MOUSEPAD, effect: { effect: typeof Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: typeof Device.MOUSEPAD, effect: { effect: typeof Effect.CUSTOM, param: NUM_ARRAY_1_BY_20 }): Promise<string>;
    //#endregion

    //#region Effects on headsets, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_06_8headset.html
    public async create(device: typeof Device.HEADSET, effect: { effect: typeof Effect.NONE }): Promise<string>;
    public async create(device: typeof Device.HEADSET, effect: { effect: typeof Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: typeof Device.HEADSET, effect: { effect: typeof Effect.CUSTOM, param: NUM_ARRAY_1_BY_5 }): Promise<string>;
    //#endregion

    //#region Effects on headsets, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_06_8headset.html
    public async create(device: typeof Device.KEYPAD, effect: { effect: typeof Effect.NONE }): Promise<string>;
    public async create(device: typeof Device.KEYPAD, effect: { effect: typeof Effect.STATIC, param: { color: number } }): Promise<string>;
    public async create(device: typeof Device.KEYPAD, effect: { effect: typeof Effect.CUSTOM, param: NUM_ARRAY_4_BY_5 }): Promise<string>;
    //#endregion

    //#region Effects on Chroma Linked Devices, see: https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_08_8chromalink.html
    public async create(device: typeof Device.CHROMALINK, effect: { effect: typeof Effect.NONE }): Promise<string>;
    public async create(device: typeof Device.CHROMALINK, effect: { effect: typeof Effect.STATIC, param: { color: Color|number } }): Promise<string>;
    public async create(device: typeof Device.CHROMALINK, effect: { effect: typeof Effect.CUSTOM, param: NUM_ARRAY_1_BY_5 }): Promise<string>;
    //#endregion

    public async create(device: Device, effect: CreateEffectRequestData): Promise<string> {
        if (!this.#sdk.devices.supported.has(device)) {
            throw new Error(`Unable to create effect for device "${device}". Did you include the device in "device_supported" during initialization?`);
        }
        const uri = new URL(this.#sdk.uri);
        uri.pathname += `/${device}`;
        const responseData: CreateEffectResponseData = await fetchWithTimeout(uri, {
            method: "POST",
            body: JSON.stringify(effect)
        });
        if (responseData.result === ErrorCode.SUCCESS) {
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
            const request: DeleteMultipleEffectsRequest = {
                ids: idOrIds
            }
            const responseData: DeleteMultipleEffectsResponse = await fetchWithTimeout(`${this.#sdk.uri}/effect`, {
                method: "DELETE",
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
