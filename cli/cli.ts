#!/usr/bin/env node
import * as program from "commander";
import { ComposeFile, ComposeDirectory, InspectDirectory, InspectFile } from "./literator";
import { resolve, join } from "path";
import { lstatSync } from "fs";
import { readJsonSync, readJSONSync } from "fs-extra";
import { config } from "./config.js";

const package_json = readJSONSync(resolve(__dirname, "../../package.json"));
program.version(package_json.version)
program.option("-w, --watch", "compose file or files in directory in watch mode");
program.parse(process.argv);

const args = program.args;

if (args.length === 0)
{
    program.help();
}
else
{
    const working_directory = process.cwd();
    const [target] = args;
    if (target)
    {

        //
        const project_package = readJsonSync(join(working_directory, "package.json"), { throws: false }) || { devDependencies: {} };

        const dsl_names = Object.keys(project_package.devDependencies).filter(key => key.startsWith("draft-dsl"));
        const dsls = dsl_names.map(name => require(`${join(working_directory, "node_modules", name)}`)?.MakeDSL());
        config.dsls = dsls;

        //
        const path = resolve(working_directory, target);
        if (lstatSync(path).isDirectory())
        {
            program.watch ? InspectDirectory(path) : ComposeDirectory(path);
        }
        else
        {
            program.watch ? InspectFile(path) : ComposeFile(path);
        }
    }
}


