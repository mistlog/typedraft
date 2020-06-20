#!/usr/bin/env node
import * as program from "commander";
import { ComposeFile, ComposeDirectory, InspectDirectory, InspectFile } from "./literator";
import { resolve } from "path";
import { readJSONSync, lstatSync } from "fs-extra";

const package_json = readJSONSync(resolve(__dirname, "../../package.json"));
program.version(package_json.version);
program.option("-w, --watch", "compose file or files in directory in watch mode");
program.parse(process.argv);

const args = program.args;

if (args.length === 0) {
    program.help();
} else {
    const working_directory = process.cwd();
    const [target] = args;
    if (target) {
        const path = resolve(working_directory, target);
        if (lstatSync(path).isDirectory()) {
            program.watch ? InspectDirectory(path) : ComposeDirectory(path);
        } else {
            program.watch ? InspectFile(path) : ComposeFile(path);
        }
    }
}
