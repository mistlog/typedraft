import { PatternMatch } from "draft-dsl-match";
import { ITypeDraftConfig } from "typedraft/dist/cli/literator";

export default {
    DSLs: [{ name: "match", dsl: () => new PatternMatch() }],
    Targets: [{ src: "draft/**/*.{ts,tsx}", dest: "src/transcript", baseDir: "draft" }],
} as ITypeDraftConfig;
