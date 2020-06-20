import * as traverse from "filewalker";
import { default as watch } from "node-watch";
import { outputFileSync, removeSync, readFileSync } from "fs-extra";
import { MakeDefaultTranscriber } from "../src";

function TraverseDirectory(path: string, callback: (name: string, path: string) => void) {
    const action = (relative: string, stats, absolute: string) => callback(relative, absolute);
    traverse(path)
        .on("file", action)
        .on("error", error => console.log(error))
        .walk();
}

export function InspectDirectory(path: string) {
    ComposeDirectory(path);

    watch(path, { recursive: true }, (event, name: string) => {
        if (name.endsWith(".tsx")) {
            console.log(event, name);
            try {
                ComposeFile(name);
            } catch (error) {
                console.log(error.message);
            }
        }
    });
}

export function InspectFile(path: string) {
    ComposeFile(path);

    watch(path, (event, name: string) => {
        if (name.endsWith(".tsx")) {
            console.log(event, name);
            try {
                ComposeFile(name);
            } catch (error) {
                console.log(error.message);
            }
        }
    });
}

export function ComposeDirectory(path: string) {
    TraverseDirectory(path, (relative: string, absolute: string) => {
        if (absolute.endsWith(".tsx")) {
            try {
                ComposeFile(absolute);
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

export function ComposeFile(source: string) {
    const code = readFileSync(source, "utf8");
    const transcriber = MakeDefaultTranscriber(code);
    const result = transcriber.Transcribe();
    outputFileSync(source.replace(".tsx", ".ts"), result, "utf8");
}
