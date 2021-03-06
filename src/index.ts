export * from "./core/transcriber";

export * from "./code-object/export-class";
export * from "./code-object/local-context";
export * from "./code-object/inline-context";
export * from "./code-object/method";
export * from "./code-object/module";

export * from "./plug-in/draft-plugin-class";
export * from "./plug-in/draft-plugin-dsl";
export * from "./plug-in/draft-plugin-filter";
export * from "./plug-in/draft-plugin-local-context";
export * from "./plug-in/draft-plugin-refresh";

export * from "./common/utility";

/**
 *
 */
import { Transcriber, ITranscriber } from "./core/transcriber";
import { RefreshDraftPlugin } from "./plug-in/draft-plugin-refresh";
import { DSLPlugin } from "./plug-in/draft-plugin-dsl";
import { LocalContextPlugin } from "./plug-in/draft-plugin-local-context";
import { ClassPlugin } from "./plug-in/draft-plugin-class";
import { FilterPlugin } from "./plug-in/draft-plugin-filter";
import { InplaceContextPlugin } from "./plug-in/draft-plugin-inplace-context";

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

declare global {
    function Λ<T>(dsl: string): (...args) => T;
    function context<T>(dsl: string): (...args) => T;
}
