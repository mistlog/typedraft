import { removeSync } from "fs-extra";
import * as traverse from "filewalker";

const src_root = `${__dirname}/../src`;
traverse(src_root).on("file", (relative: string, stats, absolute: string) =>{
    absolute.endsWith(".tsx") && removeSync(absolute.replace(".tsx", ".ts"))
}).walk();
