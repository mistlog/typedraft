/*
# Local Context Plugin
*/
export class LocalContextPlugin {
    m_Transcriber: ITranscriber;
}

/*
As context can be nested, we will translate them in order. Then find references of a context and replace them with "real" statements; 
*/

<LocalContextPlugin /> +
    function Transcribe(this: LocalContextPlugin & ILocalContextPlugin) {
        // the order we translate all context
        const to_transcribe = this.GetContextList();

        // find and replace
        to_transcribe.forEach(name => {
            const context = this.m_Transcriber.GetLocalContext(name);
            context.m_Refs.forEach(path =>
                path
                    .findParent(path => path.isExpressionStatement())
                    .replaceWithMultiple(context.ToStatements())
            );
        });
    };

/*
## Algorithm

Topological sort is used to find the deps relation of context.
*/

<LocalContextPlugin /> +
    function GetContextList(this: LocalContextPlugin) {
        const graph = [];

        this.m_Transcriber.TraverseLocalContext((context, name) => {
            context.m_Refs.forEach(path => {
                /**
                 * isFunctionDeclaration: context is used in another context
                 * isFunctionExpression: context is used in class method
                 * isExportDeclaration: context is used in export function
                 */
                const parent = path.findParent(
                    path =>
                        path.isFunctionDeclaration() ||
                        path.isFunctionExpression() ||
                        path.isExportDeclaration()
                ) as NodePath<FunctionDeclaration | FunctionExpression>;
                if (parent) {
                    /**
                     * graph edge [x, y]:
                     * if you want to transcribe y, you have to transcribe x first
                     */
                    graph.push([name, parent.node.id.name]);
                }
            });
        });

        // filter the result, because the name can be the function that uses context, instead of context itself.
        const context_list = toposort(graph).filter(name =>
            this.m_Transcriber.GetLocalContext(name)
        );
        return context_list;
    };

/*
# Trivial
*/
export class ILocalContextPlugin implements IPlugin {
    Transcribe: () => void;
    GetContextList: () => Array<string>;
}

<LocalContextPlugin /> +
    function constructor(this: LocalContextPlugin, transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };

import { ITranscriber, IPlugin } from "../core/transcriber";
import { FunctionDeclaration, FunctionExpression } from "@babel/types";
import { NodePath } from "@babel/core";
import * as toposort from "toposort";
