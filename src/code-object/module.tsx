import { Program, File, Statement } from "@babel/types";
import { ExportClassCode } from "./export-class";
import { MethodCode } from "./method";
import { LocalContext } from "./local-context";
import { Visitor } from "@babel/core";
import { ToFile } from "../common/utility";
import traverse, { NodePath, Node } from "@babel/traverse";

/*
# Draft

A .tsx file is considered as a module and we will transform these 3 types of code, they are collected and then transcibed to "real" code.

*/
export type Draft = Array<ExportClassCode | MethodCode | LocalContext>;

export class ModuleCode
{
    m_File: File;
    m_Path: NodePath<Program>;

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
    let draft: Draft = [];

    const visitor: Visitor = {
        Program(path)
        {
            path.get("body").forEach(path =>
            {
                //@ts-ignore
                <CreateDraft/>;
            })
        }
    }

    traverse(this.m_File, visitor);
    return draft;
};

/*
## Create draft
*/

function CreateDraft(path: NodePath<Node>, draft: Draft)
{
    if (path.isExportNamedDeclaration())
    {
        draft.push(new ExportClassCode(path.node, path));
    }
    else if (path.isExpressionStatement())
    {
        draft.push(new MethodCode(path.node, path));
    }
    else if (path.isFunctionDeclaration())
    {
        const name = path.node.id.name;
        const binding = path.scope.parent.getBinding(name);
        draft.push(new LocalContext(path.node, binding, path));
    }
}
/*
You may want to refer to the usage of [babel](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-bindings).
*/

/*
## Create draft
*/

/*
# Trivial
*/
<ModuleCode /> + function constructor(this: ModuleCode, code: string)
{
    this.m_File = ToFile(code);
};

