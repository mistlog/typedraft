import { removeSync } from "fs-extra";
import { resolve } from "path";

const docs_root = resolve(__dirname, "../docs");

["cli", "js", "src", "css", "coverage", "dependencies.json"].forEach((each) => {
    removeSync(resolve(docs_root, each));
});
