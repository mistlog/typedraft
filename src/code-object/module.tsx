import { isExportNamedDeclaration, isExpressionStatement, isFunctionDeclaration, File, Statement } from "@babel/types";
import { ExportClassCode } from "./export-class";
import { MethodCode } from "./method";
import { LocalContext } from "./local-context";
import { Visitor } from "@babel/core";
import { ToFile } from "../common/utility";
import traverse, { Binding } from "@babel/traverse";

export type Draft = Array<ExportClassCode | MethodCode | LocalContext>;

export class ModuleCode
{
    m_File: File;

    get m_Code() { return this.m_File.program.body; }
    set m_Code(code: Array<Statement>) { this.m_File.program.body = code; }
}

<ModuleCode /> + function constructor(this: ModuleCode, code: string)
{
    this.m_File = ToFile(code);
};


<ModuleCode /> + function ToDraft(this: ModuleCode)
{
    <SetupLocalContextBindingMap />;
    //@ts-ignore
    <CreateDraftAndReturn/>;
}

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
            collection.push(new LocalContext(node, binding_map.get(node.id.name)));
        }

        return collection;
    }, [])

    return draft;
}

function SetupLocalContextBindingMap(this: ModuleCode)
{
    const binding_map = new Map<string, Binding>();
    const visitor: Visitor = {
        Program(path)
        {
            Object.entries(path.scope.bindings).forEach(([name, binding]) =>
            {
                if (isFunctionDeclaration(binding.path.node))
                {
                    binding_map.set(name, binding);
                }
            })
        }
    }
    traverse(this.m_File, visitor);
}