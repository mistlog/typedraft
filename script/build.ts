import { removeSync } from "fs-extra";

const build_root = `${__dirname}/../dist`;
removeSync(`${build_root}/package.d.ts`);
removeSync(`${build_root}/package.json`);