/**
 * Error codes for Chroma SDK
 */
export enum ErrorCode {

    /** Invalid. */
    INVALID = -1,

    /** Success. */
    SUCCESS = 0,

    /** Access denied. */
    ACCESS_DENIED = 5,

    /** Invalid handle. */
    INVALID_HANDLE = 6,

    /** Not supported */
    NOT_SUPPORTED = 50,

    /** Invalid parameter. */
    INVALID_PARAMETER= 87,

    /** The service has not been started. */
    SERVICE_NOT_ACTIVE = 1062,

    /** Cannot start more than one instance of the specified program. */
    SINGLE_INSTANCE_APP  = 1152,

    /** Device not connected. */
    DEVICE_NOT_CONNECTED = 1167,

    /** Element not found. */
    NOT_FOUND = 1168,

    /** Request aborted. */
    REQUEST_ABORTED = 1235,

    /** An attempt was made to perform an initialization operation when initialization has already been completed. */
    ALREADY_INITIALIZED = 1247,

    /** Resource not available or disabled. */
    RESOURCE_DISABLED = 4309,

    /** Device not available or supported. */
    DEVICE_NOT_AVAILABLE = 4319,

    /** The group or resource is not in the correct state to perform the requested operation. */
    NOT_VALID_STATE = 5023,

    /** No more items. */
    NO_MORE_ITEMS = 259,

    /** General failure. */
    FAILED = 2147500037

}
