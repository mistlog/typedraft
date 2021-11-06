import { MakeDefaultTranscriber, IDSL, IPlugin } from "../src";

/**
 *
 */
export interface ITypeDraftConfig {
    DSLs: Array<{ name: string; dsl: () => IDSL }>;
    DraftPlugins?: Array<IPlugin & Function>;
    Targets: Array<{ src: string; dest: string; baseDir?: string; extension?: string }>;
}

export function MakeTranscriberWithConfig(code: string, config: ITypeDraftConfig) {
    const transcriber = MakeDefaultTranscriber(code);

    config.DSLs.forEach(({ name, dsl }) => {
        transcriber.AddDSL(name, dsl());
    });

    if (config.DraftPlugins.length !== 0) {
        transcriber.m_Plugins = config.DraftPlugins.map(PluginConstructor =>
            Reflect.construct(PluginConstructor, [transcriber])
        );
    }

    return transcriber;
}

export function ComposeFile(code: string, config?: ITypeDraftConfig) {
    const transcriber = config
        ? MakeTranscriberWithConfig(code, config)
        : MakeDefaultTranscriber(code);
    const result = transcriber.Transcribe();
    return result;
}
