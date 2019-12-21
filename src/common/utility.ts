import { template } from "@babel/core";
import { Node } from "@babel/types";
import generate, { GeneratorOptions } from "@babel/generator";
import { parse } from "@babel/parser";

export function ToAst(code: string)
{
    return template.ast(code, { plugins: ["typescript", "jsx"] });
}

export function ToFile(code: string)
{
    return parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
}

export function ToString(node: Node, options?: GeneratorOptions)
{
    return generate(node, options || {}).code;
}