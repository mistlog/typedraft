import { PatternMatch } from "draft-dsl-match";

export default {
    DSLs: [{ name: "match", dsl: () => new PatternMatch(true) }],
};
