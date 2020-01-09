import { template } from "@babel/core";
import { Node } from "@babel/types";
import generate, { GeneratorOptions } from "@babel/generator";
import { parse } from "@babel/parser";
import * as prettier from "prettier/standalone";
import * as TypescriptParser from "prettier/parser-typescript";

export function ToAst(code: string)
{
    return template.ast(code, { plugins: ["typescript", "jsx"] });
}

export function ToFile(raw: string)
{
    // babel bug: https://github.com/babel/babel/issues/8837
    const code = prettier.format(raw, {
        parser: "typescript",
        semi: false,
        plugins: [TypescriptParser]
    });

    return parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
}

export function ToString(node: Node, options?: GeneratorOptions)
{
    return generate(node, options || {}).code;
}