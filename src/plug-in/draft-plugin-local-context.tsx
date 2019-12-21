import { ITranscriber, IPlugin } from "../core/transcriber";
import { FunctionDeclaration, FunctionExpression } from "@babel/types";
import { NodePath } from "@babel/core";
import toposort = require("toposort");

export class LocalContextPlugin
{
    m_Transcriber: ITranscriber;
}

export class ILocalContextPlugin implements IPlugin
{
    Transcribe: () => void;
    GetContextList: () => Array<string>;
}

<LocalContextPlugin /> + function constructor(this: LocalContextPlugin, transcriber: ITranscriber)
{
    this.m_Transcriber = transcriber;
};

<LocalContextPlugin /> + function GetContextList(this: LocalContextPlugin)
{
    const graph = [];

    this.m_Transcriber.TraverseLocalContext((context, name) =>
    {
        context.m_Refs.forEach(path =>
        {
            /**
             * isFunctionDeclaration: context is used in another context
             * isFunctionExpression: context is used in class method
             * isExportDeclaration: context is used in export function
             */
            const parent = path.findParent(path => path.isFunctionDeclaration() || path.isFunctionExpression() || path.isExportDeclaration()) as NodePath<FunctionDeclaration | FunctionExpression>;
            if (parent)
            {
                /**
                 * graph edge [x, y]: 
                 * if you want to transcribe y, you have to transcribe x first 
                 */
                graph.push([name, parent.node.id.name]);
            }
        });
    })

    const context_list = toposort(graph).filter(name => this.m_Transcriber.GetLocalContext(name));
    return context_list;
};

<LocalContextPlugin /> + function Transcribe(this: LocalContextPlugin & ILocalContextPlugin)
{
    const to_transcribe = this.GetContextList();
    to_transcribe.forEach(name =>
    {
        const context = this.m_Transcriber.GetLocalContext(name);
        context.m_Refs.forEach(path =>
        {
            const parent = path.findParent(path => path.isExpressionStatement());
            parent.replaceWithMultiple(context.ToStatements());
        });
    })
}