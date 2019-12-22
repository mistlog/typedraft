# Transcriber

We always write code in one language and translate(compile) it to another, however, in both language, the code we write directly represent the execution flow.

When we write draft, we don't expect it executes as is, instead, it's designed to be transformed, not execute. Code is only meaningful within its' context. That's why we choose another word to differentiate it from compiler.

```typescript
export class Transcriber {
    //
    m_Module: ModuleCode;

    // the 3 types of code we will transform
    m_ClassMap: Map<string, ExportClassCode>;
    m_MethodMap: Map<string, Array<ClassMethod>>;
    m_ContextMap: Map<string, LocalContext>;

    //
    m_DSLMap: Map<string, IDSL>;
    m_Plugins: Array<IPlugin>;

    //
    get m_Code() {
        return this.m_Module.m_Code;
    }
    set m_Code(code: Array<Statement>) {
        this.m_Module.m_Code = code;
    }
}
```

A transcriber just likes a container, it's a collection of plugins. For example, to transform local context, we have ```draft-plugin-local-context```, to add class method to class, we have ```draft-plugin-class```, and ```draft-plugin-dsl``` for DSL extension support.

```typescript
<Transcriber /> +
    function Transcribe(this: Transcriber) {
        this.m_Plugins.forEach(plugin => plugin.Transcribe());
        return ToString(this.m_Module.m_File, { comments: false });
    };
```

# Preprocess

```typescript
export interface ITranscriber {
    Preprocess: () => void;
}
```

When we init a transcriber, we will preprocess code to build some maps for lookup purpose.

```typescript
<Transcriber /> +
    function Preprocess(this: Transcriber) {
        const draft = this.m_Module.ToDraft();
        draft.forEach(each => {
            if (each instanceof ExportClassCode) {
                this.m_ClassMap.set(each.m_Name, each);
            } else if (each instanceof MethodCode) {
                const { class_name, method } = each.ToClassMethod();
                const methods = this.m_MethodMap.get(class_name);
                if (!methods) {
                    this.m_MethodMap.set(class_name, [method]);
                } else {
                    methods.push(method);
                }
            } else if (each instanceof LocalContext) {
                this.m_ContextMap.set(each.m_Name, each);
            }
        });
    };
```

# Utility

Other methods are just utility.

## DSL

```typescript
export interface IDSL {
    Transcribe(block: Array<Statement>): Array<Statement>;
}
```

```typescript
export interface ITranscriber {
    GetDSL: (name: string) => IDSL;
    PrepareDSLs: () => void;
}
```

## Plugin

```typescript
export interface IPlugin {
    Transcribe(): void;
}
```

```typescript
export interface ITranscriber {
    PreparePlugins: () => void;
}
```

## Local Context

```typescript
export interface ITranscriber {
    TraverseLocalContext: (callback: ITraverseLocalContextCallback) => void;
    GetLocalContext: (name: string) => LocalContext;
}
```

```typescript
export type ITraverseLocalContextCallback = (context: LocalContext, name: string) => void;
```

## Class

```typescript
export interface ITranscriber {
    GetClass: (name: string) => ExportClassCode;
    TraverseMethod: (callback: ITraverseMethodCallback) => void;
}
```

```typescript
export type ITraverseMethodCallback = (methods: Array<ClassMethod>, class_name: string) => void;
```

# Implementation

##  DSL

```typescript
<Transcriber /> +
    function AddDSL(this: Transcriber, name: string, dsl: IDSL) {
        this.m_DSLMap.set(name, dsl);
    };
```

```typescript
<Transcriber /> +
    function GetDSL(this: Transcriber, name: string) {
        return this.m_DSLMap.get(name);
    };
```

```typescript
<Transcriber /> +
    function PrepareDSLs(this: Transcriber) {
        this.m_DSLMap.set("match", new PatternMatch());
    };
```

##  Plugin

```typescript
<Transcriber /> +
    function PreparePlugins(this: Transcriber & ITranscriber) {
        /**
         * pay attention to the default order of plugins
         * 1. resolve DSL first
         * 2. then context
         * 3. add methods to class
         * 4. remove redundant code
         */
        this.m_Plugins = [new DSLPlugin(this), new LocalContextPlugin(this), new ClassPlugin(this), new FilterPlugin(this)];
    };
```

```typescript
<Transcriber /> +
    function AddPlugin(plugin: IPlugin) {
        this.m_Plugins.push(plugin);
    };
```

##  Local Context

```typescript
<Transcriber /> +
    function GetLocalContext(this: Transcriber, name: string) {
        return this.m_ContextMap.get(name);
    };
```

```typescript
<Transcriber /> +
    function TraverseLocalContext(this: Transcriber, callback: ITraverseLocalContextCallback) {
        this.m_ContextMap.forEach((context, name) => callback(context, name));
    };
```

##  Class

```typescript
<Transcriber /> +
    function GetClass(this: Transcriber, name: string) {
        return this.m_ClassMap.get(name);
    };
```

```typescript
<Transcriber /> +
    function TraverseMethod(this: Transcriber, callback: ITraverseMethodCallback) {
        this.m_MethodMap.forEach((methods, class_name) => callback(methods, class_name));
    };
```

# Trivial

```typescript
export interface ITranscriber {
    m_Code: Array<Statement>;
}
```

```typescript
<Transcriber /> +
    function constructor(this: Transcriber & ITranscriber, _module: ModuleCode | string) {
        //
        this.m_Module = typeof _module === "string" ? new ModuleCode(_module) : _module;

        //
        this.m_ClassMap = new Map();
        this.m_MethodMap = new Map();
        this.m_ContextMap = new Map();
        this.m_DSLMap = new Map();

        //
        this.PrepareDSLs();
        this.PreparePlugins();

        //
        this.Preprocess();
    };
```