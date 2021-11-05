import { template } from "@babel/core";
import { Node } from "@babel/types";
import { NodePath } from "@babel/traverse";
import { default as Binding } from "@babel/traverse/lib/scope/binding";
import { parse } from "@babel/parser";
import generate, { GeneratorOptions } from "@babel/generator";

export function ToAst<T = any>(code: string) {
    return (template.ast(code, { plugins: ["typescript", "jsx"] }) as unknown) as T;
}

export function ToNodePath<T = any>(code: string): NodePath<T> {
    const path = new NodePath<T>(null, null);
    path.node = (ToAst(code) as unknown) as T;
    return path;
}

/**
 * only used in test to construct required binding param
 */
export function ToBinding(code: string): Binding {
    const binding = new Binding({
        path: ToNodePath<Node>(code),
        existing: null,
        identifier: null,
        scope: null,
        kind: "let",
    });
    return binding;
}

export function ToFile(raw: string) {
    // babel bug: https://github.com/babel/babel/issues/8837
    // refert to test case "transcriber.interface-no-parse-error"
    const code = raw.replace(new RegExp("^<", "gm"), ";<");
    return parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx", ["decorators", { decoratorsBeforeExport: true }]],
    });
}

export function ToString(node: Node, options?: GeneratorOptions) {
    return generate(node, options || {}).code;
}
