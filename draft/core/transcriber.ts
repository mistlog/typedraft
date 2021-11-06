import {
    Statement,
    FunctionDeclaration,
    BlockStatement,
    Expression,
    TemplateLiteral,
} from "@babel/types";
import { NodePath } from "@babel/traverse";
import { ToString } from "../common/utility";
import { ModuleCode } from "../code-object/module";
import { ExportClassCode } from "../code-object/export-class";
import { MethodCode } from "../code-object/method";
import { LocalContext } from "../code-object/local-context";
import { InlineContext } from "../code-object/inline-context";

/**
 * # Transcriber
 * We always write code in one language and translate(compile) it to another, however, in both language, the code we write directly represents the execution flow.
 * When we write draft, we don't expect it executes as is, instead, it's designed to be transformed, not executed.
 * That's why we choose another word to differentiate it from compiler.
 */
export class Transcriber {
    m_Module: ModuleCode;

    /**
     * the 4 types of code we will transform
     */
    m_ClassMap: Map<string, ExportClassCode>;
    m_MethodMap: Map<string, Array<MethodCode>>;
    m_ContextMap: Map<string, LocalContext>;
    m_InlineContextMap: Map<Symbol, InlineContext>;

    m_DSLMap: Map<string, IDSL>;
    m_Plugins: Array<IPlugin>;

    constructor(_module: string) {
        this.m_Module = new ModuleCode(_module);

        this.m_ClassMap = new Map<string, ExportClassCode>();
        this.m_MethodMap = new Map<string, Array<MethodCode>>();
        this.m_ContextMap = new Map<string, LocalContext>();
        this.m_InlineContextMap = new Map<Symbol, InlineContext>();
        this.m_DSLMap = new Map<string, IDSL>();
        this.m_Plugins = new Array<IPlugin>();
    }

    /**
     * A transcriber is just a container, it's a collection of plugins.
     * For example, to transform local context, we have `draft-plugin-local-context`, to add class method to class, we have `draft-plugin-class`, and `draft-plugin-dsl` for DSL extension support.
     */

    Transcribe() {
        this.m_Plugins.forEach(plugin => plugin.Transcribe());
        return ToString(this.m_Module.m_File, {
            comments: false,
        });
    }

    AddDSL(name: string, dsl: IDSL) {
        this.m_DSLMap.set(name, dsl);
    }

    GetDSL(name: string) {
        return this.m_DSLMap.get(name);
    }

    GetLocalContext(name: string) {
        return this.m_ContextMap.get(name);
    }

    TraverseLocalContext(callback: TraverseLocalContextCallback) {
        this.m_ContextMap.forEach((context, name) => callback(context, name));
    }

    TraverseInlineContext(callback: TraverseInlineContextCallback) {
        this.m_InlineContextMap.forEach(context => callback(context));
    }

    GetClass(name: string) {
        return this.m_ClassMap.get(name);
    }

    TraverseMethod(callback: TraverseMethodCallback) {
        this.m_MethodMap.forEach((methods, class_name) => callback(methods, class_name));
    }
}

export interface IDSL {
    Transcribe?(
        block: Array<Statement>,
        path?: NodePath<FunctionDeclaration> | NodePath<BlockStatement>
    ): Array<Statement>;

    InplaceTranscribe?(literal: NodePath<TemplateLiteral>, type: string): Expression;

    m_Merge?: boolean;
}

export interface IPlugin {
    Transcribe(): void;
}

export interface ITranscriber {
    Transcribe: () => string;

    AddDSL: (name: string, dsl: IDSL) => void;

    GetDSL: (name: string) => IDSL;
    GetClass: (name: string) => ExportClassCode;
    GetLocalContext: (name: string) => LocalContext;

    TraverseMethod: (callback: TraverseMethodCallback) => void;
    TraverseLocalContext: (callback: TraverseLocalContextCallback) => void;
    TraverseInlineContext: (callback: TraverseInlineContextCallback) => void;

    m_Module: ModuleCode;

    /**
     * the 3 types of code we will transform
     */
    m_ClassMap: Map<string, ExportClassCode>;
    m_MethodMap: Map<string, Array<MethodCode>>;
    m_ContextMap: Map<string, LocalContext>;
    m_InlineContextMap: Map<Symbol, InlineContext>;

    m_DSLMap: Map<string, IDSL>;
    m_Plugins: Array<IPlugin>;
}

export type TraverseLocalContextCallback = (context: LocalContext, name: string) => void;
export type TraverseInlineContextCallback = (context: InlineContext) => void;
export type TraverseMethodCallback = (methods: Array<MethodCode>, class_name: string) => void;
