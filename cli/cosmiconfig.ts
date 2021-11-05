#!/usr/bin/env node
import { ITypeDraftConfig } from "./literator";
import { cosmiconfig } from "cosmiconfig";
import { default as tsLoader } from "@endemolshinegroup/cosmiconfig-typescript-loader";

// find config
const explorer = cosmiconfig("typedraft", {
    searchPlaces: [`typedraft.config.ts`],
    loaders: {
        ".ts": tsLoader,
    },
});

export function withConfig(callback: (config: ITypeDraftConfig) => void) {
    explorer.search().then(configInfo => {
        let config: ITypeDraftConfig = { DSLs: [], DraftPlugins: [], Targets: [] };
        if (configInfo && !configInfo.isEmpty) {
            config = { ...config, ...configInfo.config };
        }
        callback(config);
    });
}
