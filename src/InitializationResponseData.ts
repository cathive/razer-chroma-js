import { ErrorCode } from "./ErrorCode"

export interface InitializationResponseData {
    sessionid?: number,
    uri?: string,
    result?: ErrorCode

}