import { removeSync } from "fs-extra";
// @ts-ignore
import * as traverse from "filewalker";
import { resolve } from "path";

const src_root = resolve(__dirname, "../src");

// @ts-ignore
traverse(src_root).on("file", (relative: string, stats, absolute: string) => {
    absolute.endsWith(".tsx") && removeSync(absolute.replace(".tsx", ".ts"))
}).walk();
