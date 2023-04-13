
export type Effect = "CHROMA_NONE"
                   | "CHROMA_STATIC"
                   | "CHROMA_CUSTOM"
                   | "CHROMA_CUSTOM2"
                   | "CHROMA_CUSTOM_KEY";

export namespace Effect {
    export const NONE: Effect = "CHROMA_NONE";

    export const STATIC: Effect = "CHROMA_STATIC";

    export const CUSTOM: Effect = "CHROMA_CUSTOM";

    export const CUSTOM2: Effect = "CHROMA_CUSTOM2";

    export const CUSTOM_KEY: Effect = "CHROMA_CUSTOM_KEY";
}
Object.freeze(Effect);
