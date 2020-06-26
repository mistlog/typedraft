export class InlineContext {
    m_Path: NodePath<BlockStatement>;

    get m_ID() {
        return Symbol();
    }

    get m_Code() {
        return this.m_Path.node as BlockStatement;
    }
}

<InlineContext /> +
    function constructor(this: InlineContext, path: NodePath<BlockStatement>) {
        this.m_Path = path;
    };

<InlineContext /> +
    function ToStatements(this: InlineContext) {
        return this.m_Code.body;
    };

<InlineContext /> +
    function Resolve(this: InlineContext & IInlineContext, dsl: IDSL) {
        if (dsl.m_Merge) {
            this.m_Path.replaceWithMultiple(dsl.Transcribe(this.ToStatements(), this.m_Path));
        } else {
            this.m_Code.body = dsl.Transcribe(this.ToStatements(), this.m_Path);
        }
    };

<InlineContext /> +
    function GetDSLName(this: InlineContext) {
        const statement = this.m_Path.node.body[0] as ExpressionStatement;
        if (!statement || !isStringLiteral(statement.expression)) {
            return "";
        }

        const [, dsl_name] = statement.expression.value.trim().split(" ");
        return dsl_name;
    };

export interface IInlineContext {
    ToStatements: () => Array<Statement>;
}

import { BlockStatement, ExpressionStatement, Statement, isStringLiteral } from "@babel/types";
import { NodePath } from "@babel/traverse";
import { IDSL } from "../core/transcriber";
