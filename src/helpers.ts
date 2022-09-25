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
export async function fetchWithTimeout<R>(resource: string, options: RequestInit = {}, timeout: number = DEFAULT_TIMEOUT_MS): Promise<R> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        //mode: "no-cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        cache: "no-cache",
        signal: controller.signal
    });
    clearTimeout(id);
    return (await response.json()) as R;
}

export function clamp(v: number, min: number, max: number): number {
    return v < min ? min : v > max ? max : v;
}
