import { Program, File, ExpressionStatement, ExportNamedDeclaration, FunctionDeclaration } from "@babel/types";
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
                <CreateDraft />;
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
    if (IsExportClassCode(path))
    {
        draft.push(new ExportClassCode(path.node, path));
    }
    else if (IsMethodCode(path))
    {
        draft.push(new MethodCode(path.node, path));
    }
    else if (IsLocalContext(path))
    {
        const name = path.node.id.name;
        const binding = path.scope.parent.getBinding(name);
        draft.push(new LocalContext(path.node, binding, path));
    }
}

export function IsExportClassCode(path: NodePath<Node>): path is NodePath<ExportNamedDeclaration>
{
    if (!path.isExportNamedDeclaration())
    {
        return false;
    }

    const is_export_class = path.get("declaration").isClassDeclaration();
    return is_export_class;
}

export function IsMethodCode(path: NodePath<Node>): path is NodePath<ExpressionStatement>
{
    if (!path.isExpressionStatement())
    {
        return false;
    }

    const expression = path.get("expression");
    if (!expression.isBinaryExpression())
    {
        return false;
    }

    const left_is_jsx = expression.get("left").isJSXElement();
    const right_is_function = expression.get("right").isFunctionExpression();
    return left_is_jsx && right_is_function;
}

export function IsLocalContext(path: NodePath<Node>): path is NodePath<FunctionDeclaration>
{
    if (!path.isFunctionDeclaration())
    {
        return false;
    }

    const name = path.node.id.name;
    const binding = path.scope.parent.getBinding(name);
    const is_local_context = binding.referencePaths.some(path =>
    {
        const used_as_jsx = path.parentPath?.parentPath?.isJSXElement();
        const used_as_statement = path.parentPath?.parentPath?.parentPath?.isExpressionStatement();
        return used_as_jsx && used_as_statement;
    });
    return is_local_context;
}
/*
You may want to refer to the usage of [babel](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-bindings).
*/

/*
# Trivial
*/
<ModuleCode /> + function constructor(this: ModuleCode, code: string)
{
    this.m_File = ToFile(code);
};

