```typescript
export class Transcriber {
    //
    m_Module: ModuleCode;

    //
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

# Interface of Transcriber

```typescript
export interface ITranscriber {
    //
    Preprocess: () => void;

    //
    GetDSL: (name: string) => IDSL;
    PrepareDSLs: () => void;

    //
    PreparePlugins: () => void;

    //
    GetClass: (name: string) => ExportClassCode;
    GetLocalContext: (name: string) => LocalContext;

    //
    TraverseLocalContext: (callback: ITraverseLocalContextCallback) => void;
    TraverseMethod: (callback: ITraverseMethodCallback) => void;
    m_Code: Array<Statement>;
}
```

```typescript
export type ITraverseLocalContextCallback = (context: LocalContext, name: string) => void;
```

```typescript
export type ITraverseMethodCallback = (methods: Array<ClassMethod>, class_name: string) => void;
```

# Core

```typescript
<Transcriber /> +
    function Transcribe(this: Transcriber) {
        this.m_Plugins.forEach(plugin => plugin.Transcribe());
        return ToString(this.m_Module.m_File);
    };
```

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

# Class

```typescript
<Transcriber /> +
    function GetClass(this: Transcriber, name: string) {
        return this.m_ClassMap.get(name);
    };
```

# Local Context

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

# Method

```typescript
<Transcriber /> +
    function TraverseMethod(this: Transcriber, callback: ITraverseMethodCallback) {
        this.m_MethodMap.forEach((methods, class_name) => callback(methods, class_name));
    };
```

# DSL

```typescript
export interface IDSL {
    Transpile(block: Array<Statement>): Array<Statement>;
}
```

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

# Plugin

```typescript
export interface IPlugin {
    Transcribe(): void;
}
```

```typescript
<Transcriber /> +
    function PreparePlugins(this: Transcriber & ITranscriber) {
        this.m_Plugins = [new DSLPlugin(this), new LocalContextPlugin(this), new ClassPlugin(this), new FilterPlugin(this)];
    };
```

```typescript
<Transcriber /> +
    function AddPlugin(plugin: IPlugin) {
        this.m_Plugins.push(plugin);
    };
```

# Appendix

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