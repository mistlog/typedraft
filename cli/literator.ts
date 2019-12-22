import { readFileSync } from "fs";
import { outputFileSync, removeSync } from "fs-extra";
import * as traverse from "filewalker";
import * as watch from "node-watch";
import { Transcriber, } from "../src";
import { config } from "./config";

function TraverseDirectory(path: string, callback: (name: string, path: string) => void)
{
    const action = (relative: string, stats, absolute: string) => callback(relative, absolute);
    traverse(path)
        .on("file", action)
        .walk();
}

export function InspectDirectory(path: string)
{
    ComposeDirectory(path);

    //@ts-ignore
    watch(path, { recursive: true }, (event, name: string) =>
    {
        if (name.endsWith(".tsx"))
        {
            console.log(event, name);
            try
            {
                ComposeFile(name);
            }
            catch (error)
            {
                console.log(error.message);
            }
        }
    });
}

export function InspectFile(path: string)
{
    ComposeFile(path);

    //@ts-ignore
    watch(path, (event, name: string) =>
    {
        if (name.endsWith(".tsx"))
        {
            console.log(event, name);
            try
            {
                ComposeFile(name);
            }
            catch (error)
            {
                console.log(error.message);
            }
        }
    });
}

export function ComposeDirectory(path: string)
{
    TraverseDirectory(path, (relative: string, absolute: string) =>
    {
        if (absolute.endsWith(".tsx"))
        {
            try
            {
                ComposeFile(absolute);
            } catch (error)
            {
                console.log(`compose file failed: ${error.message}, source: ${relative}`);
            }
        }
    })
}

export function CrossoutDirectory(path: string)
{
    TraverseDirectory(path, (relative: string, absolute: string) =>
    {
        if (absolute.endsWith(".tsx"))
        {
            removeSync(absolute.replace(".tsx", ".ts"));
        }
    })
}

export function ComposeFile(source: string)
{
    const code = readFileSync(source, "utf8");
    const transcriber = new Transcriber(code);
    config.dsls.forEach(dsl => transcriber.AddDSL(dsl.name, dsl.dsl));
    const result = transcriber.Transcribe();
    outputFileSync(source.replace(".tsx", ".ts"), result, "utf8");
}

