import { FunctionDeclaration, Statement } from "@babel/types";
import { Binding } from "@babel/traverse";
import { IDSL } from "../core/transcriber";

export class LocalContext
{
    m_Code: FunctionDeclaration;
    m_Binding: Binding | null;

    get m_Refs() { return this.m_Binding.referencePaths; }
    get m_Name() { return this.m_Code.id.name; }
}

export interface ILocalContext
{
    ToStatements: () => Array<Statement>;
};

<LocalContext /> + function constructor(this: LocalContext, node: FunctionDeclaration, binding?: Binding)
{
    this.m_Code = node;
    this.m_Binding = binding || null;
};

<LocalContext /> + function ToStatements(this: LocalContext)
{
    return this.m_Code.body.body;
};

<LocalContext /> + function Resolve(this: LocalContext & ILocalContext, dsl: IDSL)
{
    this.m_Code.body.directives = [];
    this.m_Code.body.body = dsl.Transpile(this.ToStatements());
};

<LocalContext /> + function GetContextName(this: LocalContext)
{
    const [directive] = this.m_Code.body.directives;
    if (directive)
    {
        const [, context_name] = directive.value.value.split(" ");
        return context_name;
    }
    return "";
}