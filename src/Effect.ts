
export type Effect = "CHROMA_NONE"
                   | "CHROMA_STATIC"
                   | "CHROMA_CUSTOM"
                   | "CHROMA_CUSTOM2"
                   | "CHROMA_CUSTOM_KEY";

export namespace Effect {
    export const NONE = "CHROMA_NONE";

    export const STATIC = "CHROMA_STATIC";

    export const CUSTOM = "CHROMA_CUSTOM";

    export const CUSTOM2 = "CHROMA_CUSTOM2";

    export const CUSTOM_KEY = "CHROMA_CUSTOM_KEY";
}
Object.freeze(Effect);
