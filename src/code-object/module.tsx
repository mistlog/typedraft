/**
 * # Draft
 * A .tsx file is considered as a module and we will transform these 4 types of code, they are collected and then transcibed to "real" code.
 */
export class ModuleCode {
    m_File: File;
    m_Path: NodePath<Program>;
}

export type Draft = Array<ExportClassCode | MethodCode | LocalContext | InlineContext>;

/**
 * As we are only interested in the draft part of a module, then we need a way to return this "view" of module code.
 */
<ModuleCode /> +
    function ToDraft(this: ModuleCode) {
        /**
         * refresh and update bindings because DSL only transforms code
         */
        this.m_File = ToFile(ToString(this.m_File));

        /**
         * traverse file and set path
         */
        let draft: Draft = [];
        traverse<{ _module: ModuleCode }>(
            this.m_File,
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
            null,
            { _module: this }
        );

        /**
         * collect draft parts
         */
        this.m_Path.get("body").forEach(path => {
            //@ts-ignore
            <AddToDraft />;
        });
        return draft;
    };

/**
 * ## Create draft
 */
function AddToDraft(path: NodePath<Node>, draft: Draft) {
    if (path.isEmptyStatement()) {
        /**
         * remove redundant ; before tag, see comment of `ToFile` in utility.ts
         */
        path.remove();
    } else if (IsExportClassCode(path)) {
        draft.push(new ExportClassCode(path));
    } else if (IsMethodCode(path)) {
        draft.push(new MethodCode(path));
    } else if (IsLocalContext(path)) {
        draft.push(new LocalContext(path.scope.parent.getBinding(path.node.id.name)));
    }
}

export function IsExportClassCode(path: NodePath<any>): path is NodePath<ExportNamedDeclaration> {
    if (!path.isExportNamedDeclaration()) {
        return false;
    }

    const declaration = path.get("declaration") as NodePath<Node>;
    return declaration.isClassDeclaration();
}

export function IsMethodCode(path: NodePath<any>): path is NodePath<ExpressionStatement> {
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

export function IsLocalContext(path: NodePath<any>): path is NodePath<FunctionDeclaration> {
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

/**
 * # Trivial
 */
<ModuleCode /> +
    function constructor(this: ModuleCode, code: string) {
        this.m_File = ToFile(code);
    };

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
import traverse, { NodePath, Node } from "@babel/traverse";
import { InlineContext } from "./inline-context";
