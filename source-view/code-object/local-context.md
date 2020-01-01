# Local Context

The concept of local context is essential in typedraft, any function declaration is treated as a local context.

```typescript
export class LocalContext {
    m_Code: FunctionDeclaration;
    m_Binding: Binding | null;
    m_Path: NodePath<FunctionDeclaration>;
    get m_Refs() {
        return this.m_Binding.referencePaths;
    }
    get m_Name() {
        return this.m_Code.id.name;
    }
}
```

The context itself does nothing but expresses our intention. If it's used with a DSL, we can resolve it to get the "real" statements.

```typescript
<LocalContext /> +
    function Resolve(this: LocalContext & ILocalContext, dsl: IDSL) {
        // because we don't need "use ..." after resolved
        this.m_Code.body.directives = [];
        this.m_Code.body.body = dsl.Transcribe(this.ToStatements(), this.m_Path);
    };
```

## Example in DSL
For example, if we want to use SQL as a DSL in typescript, we can do it in this way. Suppose that we want to select some data from an array:

```typescript
const array = [
    {name:"cpp",version:17},
    {name:"c",version:99},
    {name:"js",version:6}
]

// expected result: ["c"]
const data = array
    .filter(each=>each.name.startsWith("c") && each.version > 20)
    .map(each=>each.name);
```

In this context, we can write it as:

```typescript
function SelectData(){
    "use sql"
    
    const data = `
        select ${name} 
        from ${array} 
        where ${name.startsWith("c") && version > 20}
    `;
}
```
You may find that name, version and array are not defined. To make the compiler happy, you can add

```typescript
let name: string;
let version: number;
...
```

just above ```const data=...```. We can always find a way to both enjoy the convenience of context and leverage the power of typescript. That depends on the genius of the DSL designer.

The crux here is that as long as we have enough infomation to express our intention in this point(context), we can translate it into equvalent typescript.

## Example in Literate Programming

Suppose that we want to use that data:

```typescript
const array = [
    {name:"cpp",version:17},
    {name:"c",version:99},
    {name:"js",version:6}
]

// expected result: ["c"]
const data = array
    .filter(each=>each.name.startsWith("c") && each.version > 20)
    .map(each=>each.name);

console.log(data);
```

With context, this piece of code can be written as:

```typescript
const array = [
    {name:"cpp",version:17},
    {name:"c",version:99},
    {name:"js",version:6}
]

<SelectData/>;
<UseData/>;
```

We use JSX syntax here and the tag name is the function name. The UseData context could be:

```typescript
function UseData(){
    console.log(data)
}
```

We don't use any DSL, then we just use the "host" language and the output(statements) would be just the input. Besides, as functions can be placed in any place in a source file, we can rearrange code now.

# Utility

```typescript
<LocalContext /> +
    function ToStatements(this: LocalContext) {
        return this.m_Code.body.body;
    };
```

```typescript
<LocalContext /> +
    function GetContextName(this: LocalContext) {
        const [directive] = this.m_Code.body.directives;
        if (directive) {
            const [, context_name] = directive.value.value.split(" ");
            return context_name;
        }
        return "";
    };
```

# Trivial

```typescript
<LocalContext /> +
    function constructor(this: LocalContext, node: FunctionDeclaration, binding?: Binding, path?: NodePath<FunctionDeclaration>) {
        this.m_Code = node;

        // binding is used to find all references to this context, thus we can replace them with resolved statements
        this.m_Binding = binding || null;
        this.m_Path = path;
    };
```

```typescript
export interface ILocalContext {
    ToStatements: () => Array<Statement>;
}
```