import {
    Program,
    File,
    ExpressionStatement,
    ExportNamedDeclaration,
    FunctionDeclaration,
} from "@babel/types";
import { ExportClassCode } from "./export-class";
import { MethodCode } from "./method";
import { LocalContext } from "./local-context";
import { ToFile, ToString } from "../common/utility";
import traverse, { NodePath, Node, TraverseOptions } from "@babel/traverse";
import { InlineContext } from "./inline-context";
import { MatchDSL, __ } from "draft-dsl-match";

/**
 * # Draft
 * A .tsx file is considered as a module and we will transform these 4 types of code, they are collected and then transcibed to "real" code.
 */
export class ModuleCode {
    m_File: File;
    m_Path: NodePath<Program>;

    constructor(code: string) {
        this.m_File = ToFile(code);
    }

    /**
     * As we are only interested in the draft part of a module, then we need a way to return this "view" of module code.
     */
    ToDraft() {
        /**
         * refresh and update bindings because DSL only transforms code
         */
        this.m_File = ToFile(ToString(this.m_File));

        /**
         * traverse file and set path
         */
        let draft: Draft = [];
        this.Traverse<{ _module: ModuleCode }>(
            {
                Program(path) {
                    this._module.m_Path = path;
                },

                ExpressionStatement(path) {
                    const expression = path.get("expression");
                    if (expression.isStringLiteral()) {
                        const literal = expression.node.value.trim();
                        if (literal.startsWith("use") && path.parentPath.isBlockStatement()) {
                            /**
                             * inline context should be resolved from deepest
                             */
                            draft.unshift(new InlineContext(path.parentPath));
                        }
                    }
                },
            },
            { _module: this }
        );

        /**
         * collect draft parts
         */
        this.m_Path.get("body").forEach(path => {
            /**
             * remove redundant ; before tag, see comment of `ToFile` in utility.ts
             */
            if (path.isEmptyStatement()) {
                path.remove();
                return;
            }

            // prettier-ignore
            const to_add = Λ<ExportClassCode | LocalContext | MethodCode | null>("match")` ${path as NodePath<any>} 
                ${IsExportClassCode(path)} -> ${(path: NodePath<ExportNamedDeclaration>) => new ExportClassCode(path)}
                ${IsMethodCode(path)} -> ${(path: NodePath<ExpressionStatement>) => new MethodCode(path)}
                ${IsLocalContext(path)} -> ${(path: NodePath<FunctionDeclaration>) => new LocalContext(path.scope.parent.getBinding(path.node.id.name))}
                ${__} -> ${null}
            `;

            if (to_add) {
                draft.push(to_add);
            }
        });
        return draft;
    }

    Traverse<S>(this: ModuleCode, visitor: TraverseOptions<S>, state: S = null) {
        this.m_File = ToFile(ToString(this.m_File));
        traverse<S>(this.m_File, visitor, null, state);
    }
}

export type Draft = Array<ExportClassCode | MethodCode | LocalContext | InlineContext>;

export function IsExportClassCode(path: NodePath<any>) {
    return (
        path.isExportNamedDeclaration() &&
        (path.get("declaration") as NodePath<Node>).isClassDeclaration()
    );
}

export function IsMethodCode(path: NodePath<any>) {
    if (!path.isExpressionStatement()) {
        return false;
    }

    const expression = path.get("expression") as NodePath<Node>;
    if (!expression.isBinaryExpression()) {
        return false;
    }

    const left = expression.get("left") as NodePath<Node>;
    const right = expression.get("right") as NodePath<Node>;
    return left.isJSXElement() && right.isFunctionExpression();
}

export function IsLocalContext(path: NodePath<any>) {
    if (!path.isFunctionDeclaration()) {
        return false;
    }

    const [directive]: [string] = path.node.body.directives;

    const is_local_context = path.scope.parent
        .getBinding(path.node.id.name)
        .referencePaths.some(path => {
            const used_as_jsx = path.parentPath?.parentPath?.isJSXElement();
            const used_as_statement = path.parentPath?.parentPath?.parentPath?.isExpressionStatement();
            const has_context = Boolean(directive);
            return used_as_jsx && (has_context || used_as_statement);
        });
    return is_local_context;
}
