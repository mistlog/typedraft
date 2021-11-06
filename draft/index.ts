declare global {
    function Λ<T>(dsl: string): (...args) => T;
    function context<T>(dsl: string): (...args) => T;
}

export * from "./core/transcriber";
export * from "./code-object";
export * from "./plug-in";
export * from "./common";

import { Transcriber, ITranscriber } from "./core/transcriber";
import {
    RefreshDraftPlugin,
    DSLPlugin,
    LocalContextPlugin,
    ClassPlugin,
    FilterPlugin,
    InplaceContextPlugin,
} from "./plug-in";

export function MakeDefaultTranscriber(_module: string): ITranscriber {
    const transcriber = new Transcriber(_module);
    transcriber.m_Plugins = [
        new InplaceContextPlugin(transcriber),
        new RefreshDraftPlugin(transcriber),
        new DSLPlugin(transcriber),
        new RefreshDraftPlugin(transcriber),
        new LocalContextPlugin(transcriber),
        new ClassPlugin(transcriber),
        new FilterPlugin(transcriber),
    ];
    return transcriber;
}
