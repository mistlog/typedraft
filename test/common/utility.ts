import { outputFileSync } from "fs-extra";

export function WriteOutput(name: string, json: object) {
    outputFileSync(`${__dirname}/../output/${name}.json`, JSON.stringify(json, null, 4));
}
