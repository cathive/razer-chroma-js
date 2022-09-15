import { VersionInfo } from "./VersionInfo";
import { Device } from "./Device";
import { ErrorCode } from "./ErrorCode";
import { InitializationRequestData } from "./InitializationRequestData";
import { InitializationResponseData } from "./InitializationResponseData";

export { Device } from "./Device";
export { ErrorCode } from "./ErrorCode";

export const ALL_DEVICES = [
    Device.KEYBOARD,
    Device.MOUSE,
    Device.HEADSET,
    Device.MOUSEPAD,
    Device.KEYPAD,
    Device.CHROMALINK
];

const DEFAULT_TIMEOUT_MS = 2000;

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

async function fetchWithTimeout(resource: string, options: {[key: string]: any} = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}

interface RazerChromaSDKInitArgs {
    readonly sessionId: number;
    readonly uri: string;
}

export class RazerChromaSDK {

    /** URI of the Chroma SDK RESTful server */
    static uri: string = "http://localhost:54235/razer/chromasdk";

    /** Heartbeat interval in milliseconds. */
    static heartbeatInterval: number = 3000;

    /**
     * Returns the current Chroma SDK version that is present in the system.
     * @returns
     *   the current Chroma SDK version that is present in the system.
     */
    static async getVersionInfo(): Promise<VersionInfo> {
        const response = await fetch(RazerChromaSDK.uri, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-cache"
        });
        const data: VersionInfo = await response.json();
        return data;
    }

    static async initialize(initData: InitializationRequestData): Promise<RazerChromaSDK> {
        validateInitData(initData);
        const response = await fetch(RazerChromaSDK.uri, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-cache",
            body: JSON.stringify(initData)
        });
        const data: InitializationResponseData = await response.json();
        if (data.result != null && data.result !== ErrorCode.SUCCESS) {
            throw new Error(`Initialization of Razer Chrome SDK failed: ${data.result}`);
        }
        return new RazerChromaSDK({ sessionId: data.sessionid!, uri: data.uri! })
    }

    #sessionId: number | null;
    #uri: string;
    #heartbeat: {
        handle: number,
        fn: () => Promise<void>
    }
    #tick: number;

    #mousepad;

    constructor(initArgs: RazerChromaSDKInitArgs) {
        this.#sessionId = initArgs.sessionId;
        this.#uri = initArgs.uri;
        this.#heartbeat = {
            handle: NaN,
            fn: async () => {
                try {
                    const response = await fetchWithTimeout(`${this.#uri}/heartbeat`, {
                        method: "PUT"
                    });
                    const data = await response.json();
                    this.#tick = data.tick;
                } catch (e) {
                    console.log(e);
                }
            }
        }
        this.#tick = NaN;
        this.#mousepad = new MousepadFX(this);
        this.#heartbeat.handle = setInterval(this.#heartbeat.fn, RazerChromaSDK.heartbeatInterval, this.uri);

    }
    get uri() {
        return this.#uri;
    }
    get sessionId() {
        return this.#sessionId;
    }
    get tick() {
        return this.#tick;
    }
    toString() {
      return `ChromaSDK <Session ID: #${this.#sessionId || "None"}>`
    }
    async uninitialize() {
        if (this.#heartbeat != null) {
            clearInterval(this.#heartbeat.handle);
            this.#heartbeat.handle = NaN;
            await fetchWithTimeout(this.#uri, {
                method: "DELETE" 
            });
            this.#sessionId = null;
        }
        this.#tick = -1;
    }
    get mousepad() { return this.#mousepad; }
}

class MousepadFX {

  #effects: Map<string, any>;
  #sdk: RazerChromaSDK;

  constructor(sdk: RazerChromaSDK) {
    this.#effects = new Map();
    this.#sdk = sdk
  }

  async createNone() {
    const fx = {
      effect: "CHROMA_NONE"
    };
    const response = await fetchWithTimeout(`${this.#sdk.uri}/mousepad`, {
      timeout: 15000,
      method: "POST",
      body: JSON.stringify(fx)
    });
    const data = await response.json();
    if (data.result === 0) {
      this.#effects.set(data.id, fx);
    }
    return data.id;
  }
  
}
