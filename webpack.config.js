const path = require("path");

module.exports = {
    entry: "./dist/src/index.js",
    output: {
        path: path.resolve(__dirname, "dist/browser"),
        filename: "index.js",
        // library: 'TypeDraft',
        libraryTarget: "commonjs",
    },
    node: {
        fs: "empty",
    },
};
