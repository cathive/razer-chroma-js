/**
 * Default timeout in milliseconds to wait before a request gets cancelled.
 */
const DEFAULT_TIMEOUT_MS = 2000;

/**
 * Wrapper around "fetch" where an optional timeout can be specified to cancel
 * requests if they take to long.
 * @param resource
 *   URI of the resource to be called.
 * @param options
 *   Fetch options for the request.
 * @returns
 *
 */
export async function fetchWithTimeout<R>(resource: string|URL, options: RequestInit = {}, timeout: number = DEFAULT_TIMEOUT_MS): Promise<R> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        cache: "no-cache",
        signal: controller.signal
    });
    clearTimeout(id);
    if (response.ok) {
        return (await response.json()) as R;
    } else {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
}

export function clamp(v: number, min: number, max: number): number {
    return v < min ? min : v > max ? max : v;
}

export async function sleep(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
