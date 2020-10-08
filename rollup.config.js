import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
// import autoNamedExports from 'rollup-plugin-auto-named-exports';

// import builtins from 'rollup-plugin-node-builtins';
// import babel from '@rollup/plugin-babel';
// import globals from 'rollup-plugin-node-globals';

export default {
    input: "dist/src/index.js",
    output: {
        sourcemap: false,
        format: "cjs",
        file: "dist/browser/index.js",
        exports: "named",
    },
    // external: ['@babel/core',  '@babel/types', '@babel/traverse', '@babel/parser', '@babel/generator'],
    plugins: [
        // babel({ babelHelpers: 'bundled' }),
        resolve({
            browser: true,
        }),
        commonjs(),
        // autoNamedExports(),
        json(),
        // globals(),
        // builtins(),
    ],
};
