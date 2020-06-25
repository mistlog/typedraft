import { removeSync } from "fs-extra";
import { resolve } from "path";

const dist_root = resolve(__dirname, "../dist");
removeSync(dist_root);
