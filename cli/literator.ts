import * as traverse from "filewalker";
import { default as watch } from "node-watch";
import { outputFileSync, removeSync, readFileSync } from "fs-extra";
import { MakeDefaultTranscriber, IDSL, IPlugin, Transcriber } from "../src";

/**
 *
 */
export interface ITypeDraftConfig {
    DSLs: Array<{ name: string; dsl: () => IDSL }>;
    DraftPlugins: Array<IPlugin & Function>;
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

/**
 *
 */
function TraverseDirectory(path: string, callback: (name: string, path: string) => void) {
    const action = (relative: string, stats, absolute: string) => callback(relative, absolute);
    traverse(path)
        .on("file", action)
        .on("error", error => console.log(error))
        .walk();
}

export function InspectDirectory(path: string, config?: ITypeDraftConfig) {
    ComposeDirectory(path, config);

    watch(path, { recursive: true }, (event, name: string) => {
        if (name.endsWith(".tsx")) {
            console.log(event, name);
            try {
                ComposeFile(name, config);
            } catch (error) {
                console.log(error.message);
            }
        }
    });
}

export function InspectFile(path: string, config?: ITypeDraftConfig) {
    ComposeFile(path, config);

    watch(path, (event, name: string) => {
        if (name.endsWith(".tsx")) {
            console.log(event, name);
            try {
                ComposeFile(name, config);
            } catch (error) {
                console.log(error.message);
            }
        }
    });
}

export function ComposeDirectory(path: string, config?: ITypeDraftConfig) {
    TraverseDirectory(path, (relative: string, absolute: string) => {
        if (absolute.endsWith(".tsx")) {
            try {
                ComposeFile(absolute, config);
            } catch (error) {
                console.log(`compose file failed: ${error.message}, source: ${relative}`);
            }
        }
    });
}

export function CrossoutDirectory(path: string) {
    TraverseDirectory(path, (relative: string, absolute: string) => {
        if (absolute.endsWith(".tsx")) {
            removeSync(absolute.replace(".tsx", ".ts"));
        }
    });
}

export function ComposeFile(source: string, config?: ITypeDraftConfig) {
    const code = readFileSync(source, "utf8");
    const transcriber = config
        ? MakeTranscriberWithConfig(code, config)
        : MakeDefaultTranscriber(code);
    const result = transcriber.Transcribe();
    outputFileSync(source.replace(".tsx", ".ts"), result, "utf8");
}
