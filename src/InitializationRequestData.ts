import { Category } from "./Category";
import { Device } from "./Device";

export interface InitializationRequestData {
    readonly title: string;
    readonly description: string;
    readonly author: {
        readonly name: string,
        readonly contact: string
    },
    readonly device_supported: Device[],
    readonly category: Category
}