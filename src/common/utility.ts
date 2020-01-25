import { template } from "@babel/core";
import { Node } from "@babel/types";
import generate, { GeneratorOptions } from "@babel/generator";
import { parse } from "@babel/parser";

export function ToAst(code: string)
{
    return template.ast(code, { plugins: ["typescript", "jsx"] });
}

export function ToFile(raw: string)
{
    // babel bug: https://github.com/babel/babel/issues/8837
    // refert to test case "transcriber.interface-no-parse-error"
    const code = raw.replace(new RegExp("^<","gm"),";<");
    return parse(code, { sourceType: "module", plugins: ["typescript", "jsx", "optionalChaining"] });
}

export function ToString(node: Node, options?: GeneratorOptions)
{
    return generate(node, options || {}).code;
}