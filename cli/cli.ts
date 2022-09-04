#!/usr/bin/env node
import * as program from "commander";
import { ComposeFile } from "./literator";
import { resolve } from "path";
import { readJSONSync } from "fs-extra";
import { build, clean, dev, IDevConfig } from "cli-common";
import { withConfig } from "./cosmiconfig";

const package_json = readJSONSync(resolve(__dirname, "../../package.json"));
program.version(package_json.version);

program.command("help").action(() => {
    program.help();
});

program.command("dev").action(() => {
    withConfig(config => {
        config.Targets.forEach(({ src, dest, baseDir, extension = ".ts" }) => {
            const devConfig: IDevConfig = {
                rename: {
                    extension,
                },
                transform(path, code) {
                    if (path.endsWith(".tsx")) {
                        let result = "";
                        try {
                            result = ComposeFile(code, config);
                        } catch (error) {
                            console.trace(error);
                        }
                        return result;
                    } else {
                        return code;
                    }
                },
            };
            if (baseDir) {
                devConfig.baseDir = baseDir;
            }
            dev(src, dest, devConfig);
        });
    });
});

program.command("build").action(() => {
    withConfig(config => {
        config.Targets.forEach(({ src, dest, baseDir, extension = ".ts" }) => {
            const devConfig: IDevConfig = {
                rename: {
                    extension,
                },
                transform(path, code) {
                    if (path.endsWith(".tsx")) {
                        const result = ComposeFile(code, config);
                        return result;
                    } else {
                        return code;
                    }
                },
            };
            if (baseDir) {
                devConfig.baseDir = baseDir;
            }
            build(src, dest, devConfig);
        });
    });
});

program.command("clean").action(() => {
    withConfig(config => {
        config.Targets.forEach(({ dest }) => {
            clean(dest);
        });
    });
});

program.parse(process.argv);
