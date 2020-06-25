const { PatternMatch } = require("draft-dsl-match");

module.exports = {
    DSLs: [{ name: "match", dsl: () => new PatternMatch(true) }],
};
