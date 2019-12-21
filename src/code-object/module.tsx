import { isExportNamedDeclaration, isExpressionStatement, isFunctionDeclaration, File, Statement } from "@babel/types";
import { ExportClassCode } from "./export-class";
import { MethodCode } from "./method";
import { LocalContext } from "./local-context";
import { Visitor } from "@babel/core";
import { ToFile } from "../common/utility";
import traverse, { Binding } from "@babel/traverse";

/*
# Draft

A .tsx file is considered as a module and we will transform these 3 types of code, they are collected and then transcibed to "real" code.

*/
export type Draft = Array<ExportClassCode | MethodCode | LocalContext>;

export class ModuleCode
{
    m_File: File;

    get m_Code() { return this.m_File.program.body; }
    set m_Code(code: Array<Statement>) { this.m_File.program.body = code; }
}

/*
## Example

Typical file with draft would be:

```typescript
export class Foo {
    static foo: number;
}

<Foo/> + function Test(this: Foo, a: number, b: string){
    <Bar/>;
    return a.toString()+b;
};

function Bar(this: Foo, a: number, b: string){
    a += this.foo;
    <Nested/>
    console.log("bar");
}

function Nested(){
    console.log("nested");
}
```

The transcribed code would be:

```typescript
export class Foo {
  static foo: number;

  Test(a: number, b: string) {
    a += this.foo;
    console.log("nested");
    console.log("bar");
    return a.toString() + b;
  }
}
```

*/

/*
# View Module as Draft

As we are only interested in the draft part of a module, then we need a way to return this "view" of module code.
*/
<ModuleCode /> + function ToDraft(this: ModuleCode)
{
    <SetupLocalContextBindingMap />;
    //@ts-ignore
    <CreateDraftAndReturn/>;
};

/*
## Record references to local context
*/

function SetupLocalContextBindingMap(this: ModuleCode)
{
    const binding_map = new Map<string, Binding>();
    const visitor: Visitor = {
        Program(path)
        {
            Object.entries(path.scope.bindings).forEach(([name, binding]) =>
            {
                /**
                 * we treat function declaration as local context, thus we record bindings of it
                 */
                if (isFunctionDeclaration(binding.path.node))
                {
                    binding_map.set(name, binding);
                }
            })
        }
    }
    traverse(this.m_File, visitor);
}
/*
You may want to refer to the usage of [babel](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-bindings).
*/

/*
## Create draft
*/

function CreateDraftAndReturn(this: ModuleCode, binding_map: Map<string, Binding>)
{
    const draft: Draft = this.m_Code.reduce((collection: Draft, node) =>
    {
        if (isExportNamedDeclaration(node))
        {
            collection.push(new ExportClassCode(node));
        }
        else if (isExpressionStatement(node))
        {
            collection.push(new MethodCode(node));
        }
        else if (isFunctionDeclaration(node))
        {
            // the binding map we build previously is used here to create local context
            collection.push(new LocalContext(node, binding_map.get(node.id.name)));
        }

        return collection;
    }, [])

    return draft;
}

/*
# Trivial
*/
<ModuleCode /> + function constructor(this: ModuleCode, code: string)
{
    this.m_File = ToFile(code);
};

