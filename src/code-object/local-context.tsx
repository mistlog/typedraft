/**
 * # Local Context
 */
export class LocalContext {
    m_Binding: Binding;

    get m_Path() {
        return this.m_Binding.path as NodePath<FunctionDeclaration>;
    }
    get m_Code() {
        return this.m_Path.node;
    }
    get m_Refs() {
        return this.m_Binding.referencePaths;
    }
    get m_Name() {
        return this.m_Code.id.name;
    }
}

/**
 * The context itself does nothing but expresses our intention. If it's used with a DSL, we can resolve it to get the "real" statements.
 */
<LocalContext /> +
    function Resolve(this: LocalContext & ILocalContext, dsl: IDSL) {
        /**
         * remove all directives, because we don't need "use ..." after resolved
         */
        this.m_Code.body.directives = [];
        this.m_Code.body.body = dsl.Transcribe(this.ToStatements(), this.m_Path);
    };

<LocalContext /> +
    function ToStatements(this: LocalContext) {
        return this.m_Code.body.body;
    };

<LocalContext /> +
    function GetDSLName(this: LocalContext) {
        const [directive] = this.m_Code.body.directives;
        if (directive) {
            const [use, dsl_name] = directive.value.value.split(" ");
            return dsl_name;
        }
        return "";
    };

/**
 * # Trivial
 */
<LocalContext /> +
    function constructor(this: LocalContext, binding: Binding) {
        /**
         * binding is used to find all references to this context, thus we can replace them with resolved statements
         */
        this.m_Binding = binding;
    };

export interface ILocalContext {
    ToStatements: () => Array<Statement>;
}

import { FunctionDeclaration, Statement } from "@babel/types";
import { Binding, NodePath } from "@babel/traverse";
import { IDSL } from "../core/transcriber";
