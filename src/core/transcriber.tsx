import { ModuleCode } from "../code-object/module";
import { ExportClassCode } from "../code-object/export-class";
import { MethodCode } from "../code-object/method";
import { ClassMethod, Statement, FunctionDeclaration } from "@babel/types";
import { ClassPlugin } from "../plug-in/draft-plugin-class";
import { FilterPlugin } from "../plug-in/draft-plugin-filter";
import { LocalContextPlugin } from "../plug-in/draft-plugin-local-context";
import { LocalContext } from "../code-object/local-context";
import { DSLPlugin } from "../plug-in/draft-plugin-dsl";
import { ToString } from "../common/utility";
import { NodePath } from "@babel/traverse";
import { RefreshDraftPlugin } from "../plug-in/draft-plugin-refresh";

/*
# Transcriber

We always write code in one language and translate(compile) it to another, however, in both language, the code we write directly represent the execution flow.

When we write draft, we don't expect it executes as is, instead, it's designed to be transformed, not execute. Code is only meaningful within its' context. That's why we choose another word to differentiate it from compiler.

*/
export class Transcriber
{
    //
    m_Module: ModuleCode;

    // the 3 types of code we will transform
    m_ClassMap: Map<string, ExportClassCode>;
    m_MethodMap: Map<string, Array<MethodCode>>;
    m_ContextMap: Map<string, LocalContext>;

    //
    m_DSLMap: Map<string, IDSL>;
    m_Plugins: Array<IPlugin>;
}

/*
A transcriber just likes a container, it's a collection of plugins. For example, to transform local context, we have ```draft-plugin-local-context```, to add class method to class, we have ```draft-plugin-class```, and ```draft-plugin-dsl``` for DSL extension support.
*/
<Transcriber /> + function Transcribe(this: Transcriber)
{
    this.m_Plugins.forEach(plugin => plugin.Transcribe());
    return ToString(this.m_Module.m_File, { comments: false });
};

/*
# Preprocess
*/
export interface ITranscriber
{
    Preprocess: () => void;
    RefreshDraft: () => void;
};

/*
When we init a transcriber, we will preprocess code to build some maps for lookup purpose.
*/
<Transcriber /> + function Preprocess(this: Transcriber)
{
    const draft = this.m_Module.ToDraft();;
    draft.forEach(each =>
    {
        if (each instanceof ExportClassCode)
        {
            this.m_ClassMap.set(each.m_Name, each);
        }
        else if (each instanceof MethodCode)
        {
            const class_name = each.m_ClassName;
            const methods = this.m_MethodMap.get(class_name);
            methods ? methods.push(each) : this.m_MethodMap.set(class_name, [each]);
        }
        else if (each instanceof LocalContext)
        {
            this.m_ContextMap.set(each.m_Name, each);
        }
    })
};

<Transcriber /> + function RefreshDraft(this: Transcriber & ITranscriber)
{
    //
    this.m_ClassMap.clear();
    this.m_MethodMap.clear();
    this.m_ContextMap.clear();

    //
    this.Preprocess();
};
/*
# Utility

Other methods are just utility.
*/

/*
## DSL
*/
export interface IDSL
{
    Transcribe(block: Array<Statement>, path?: NodePath<FunctionDeclaration>): Array<Statement>;
};

export interface ITranscriber
{
    GetDSL: (name: string) => IDSL;
    PrepareDSLs: () => void;
}

/*
## Plugin
*/

export interface IPlugin
{
    Transcribe(): void;
};

export interface ITranscriber
{
    PreparePlugins: () => void;
}

/*
## Local Context
*/
export interface ITranscriber
{
    TraverseLocalContext: (callback: TraverseLocalContextCallback) => void;
    GetLocalContext: (name: string) => LocalContext;
}

export type TraverseLocalContextCallback = (context: LocalContext, name: string) => void;

/*
## Class
*/
export interface ITranscriber
{

    GetClass: (name: string) => ExportClassCode;
    TraverseMethod: (callback: TraverseMethodCallback) => void;
};


export type TraverseMethodCallback = (methods: Array<MethodCode>, class_name: string) => void;

/*
# Implementation
*/

/*
##  DSL
*/
<Transcriber /> + function AddDSL(this: Transcriber, name: string, dsl: IDSL)
{
    this.m_DSLMap.set(name, dsl);
};

<Transcriber /> + function GetDSL(this: Transcriber, name: string)
{
    return this.m_DSLMap.get(name);
};

<Transcriber /> + function PrepareDSLs(this: Transcriber)
{
};

/*
##  Plugin
*/

<Transcriber /> + function PreparePlugins(this: Transcriber & ITranscriber)
{
    /**
     * pay attention to the default order of plugins
     * 1. resolve DSL first
     * 2. then context
     * 3. add methods to class
     * 4. remove redundant code
     */
    this.m_Plugins = [
        new RefreshDraftPlugin(this),
        new DSLPlugin(this),
        new RefreshDraftPlugin(this),
        new LocalContextPlugin(this),
        new ClassPlugin(this),
        new FilterPlugin(this)
    ];
};

<Transcriber /> + function AddPlugin(plugin: IPlugin)
{
    this.m_Plugins.push(plugin);
};

/*
##  Local Context
*/
<Transcriber /> + function GetLocalContext(this: Transcriber, name: string)
{
    return this.m_ContextMap.get(name);
};

<Transcriber /> + function TraverseLocalContext(this: Transcriber, callback: TraverseLocalContextCallback)
{
    this.m_ContextMap.forEach((context, name) => callback(context, name));
};

/*
##  Class
*/
<Transcriber /> + function GetClass(this: Transcriber, name: string)
{
    return this.m_ClassMap.get(name);
};

<Transcriber /> + function TraverseMethod(this: Transcriber, callback: TraverseMethodCallback)
{
    this.m_MethodMap.forEach((methods, class_name) => callback(methods, class_name));
};


/*
# Trivial
*/
< Transcriber /> + function constructor(this: Transcriber & ITranscriber, _module: string)
{
    //
    this.m_Module = new ModuleCode(_module);

    //
    this.m_ClassMap = new Map<string, ExportClassCode>();
    this.m_MethodMap = new Map<string, Array<MethodCode>>();
    this.m_ContextMap = new Map<string, LocalContext>();
    this.m_DSLMap = new Map<string, IDSL>();

    //
    this.PrepareDSLs();
    this.PreparePlugins();
};

