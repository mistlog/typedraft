#!/usr/bin/env node
import * as program from "commander";
import {
    ComposeFile,
    ComposeDirectory,
    InspectDirectory,
    InspectFile,
    ITypeDraftConfig,
} from "./literator";
import { resolve } from "path";
import { readJSONSync, lstatSync } from "fs-extra";
import { cosmiconfig } from "cosmiconfig";
import { default as tsLoader } from "@endemolshinegroup/cosmiconfig-typescript-loader";

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

        // find config
        const explorer = cosmiconfig("typedraft", {
            searchPlaces: [`typedraft.config.ts`],
            loaders: {
                ".ts": tsLoader,
            },
        });

        explorer.search().then(config_info => {
            let config: ITypeDraftConfig = { DSLs: [], DraftPlugins: [] };
            if (config_info && !config_info.isEmpty) {
                config = { ...config, ...config_info.config };
            }

            //
            if (lstatSync(path).isDirectory()) {
                program.watch ? InspectDirectory(path, config) : ComposeDirectory(path, config);
            } else {
                program.watch ? InspectFile(path, config) : ComposeFile(path, config);
            }
        });
    }
}
