export type ErrorCode = number;

/**
 * Error codes for Chroma SDK
 */
export namespace ErrorCode {

    /** Invalid. */
    export const INVALID: ErrorCode = -1;

    /** Success. */
    export const SUCCESS: ErrorCode = 0;

    /** Access denied. */
    export const ACCESS_DENIED: ErrorCode = 5;

    /** Invalid handle. */
    export const INVALID_HANDLE: ErrorCode = 6;

    /** Not supported */
    export const NOT_SUPPORTED: ErrorCode = 50;

    /** Invalid parameter. */
    export const INVALID_PARAMETER: ErrorCode = 87;

    /** The service has not been started. */
    export const SERVICE_NOT_ACTIVE: ErrorCode = 1062;

    /** Cannot start more than one instance of the specified program. */
    export const SINGLE_INSTANCE_APP: ErrorCode = 1152;

    /** Device not connected. */
    export const DEVICE_NOT_CONNECTED: ErrorCode = 1167;

    /** Element not found. */
    export const NOT_FOUND: ErrorCode = 1168;

    /** Request aborted. */
    export const REQUEST_ABORTED: ErrorCode = 1235;

    /** An attempt was made to perform an initialization operation when initialization has already been completed. */
    export const ALREADY_INITIALIZED: ErrorCode = 1247;

    /** Resource not available or disabled. */
    export const RESOURCE_DISABLED: ErrorCode = 4309;

    /** Device not available or supported. */
    export const DEVICE_NOT_AVAILABLE: ErrorCode = 4319;

    /** The group or resource is not in the correct state to perform the requested operation. */
    export const NOT_VALID_STATE: ErrorCode = 5023;

    /** No more items. */
    export const NO_MORE_ITEMS: ErrorCode = 259;

    /** General failure. */
    export const FAILED: ErrorCode = 2147500037;

}
Object.freeze(ErrorCode);
