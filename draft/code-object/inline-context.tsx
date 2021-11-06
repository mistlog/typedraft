import { BlockStatement, ExpressionStatement, Statement } from "@babel/types";
import { NodePath } from "@babel/traverse";
import { IDSL } from "../core/transcriber";
import { MatchDSL, __, use } from "draft-dsl-match";

export interface IInlineContext {
    ToStatements: () => Array<Statement>;
}

export class InlineContext {
    m_Path: NodePath<BlockStatement>;

    get m_ID() {
        return Symbol();
    }

    get m_Code() {
        return this.m_Path.node as BlockStatement;
    }

    constructor(path: NodePath<BlockStatement>) {
        this.m_Path = path;
    }

    ToStatements() {
        return this.m_Code.body;
    }

    Resolve(dsl: IDSL) {
        if (dsl.m_Merge) {
            this.m_Path.replaceWithMultiple(dsl.Transcribe(this.ToStatements(), this.m_Path));
        } else {
            this.m_Code.body = dsl.Transcribe(this.ToStatements(), this.m_Path);
        }
    }

    GetDSLName() {
        const statement = this.m_Path.node.body[0] as ExpressionStatement;
        return Λ<string>("match")` ${statement} 
            ${{ expression: { type: "StringLiteral", value: use("text") } }} -> ${(_, { text }) => {
            const [use, dsl_name] = text.trim().split(" ");
            return dsl_name;
        }}
            ${__} -> ${""}
        `;
    }
}
