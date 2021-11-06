import { ITranscriber, IPlugin } from "../core";
import { FunctionDeclaration, FunctionExpression } from "@babel/types";
import { NodePath } from "@babel/core";
import * as toposort from "toposort";

export class LocalContextPlugin {
    m_Transcriber: ITranscriber;

    Transcribe() {
        const to_transcribe = this.GetContextList();
        to_transcribe.forEach(name => {
            const context = this.m_Transcriber.GetLocalContext(name);
            context.m_Refs.forEach(path =>
                path
                    .findParent(path => path.isExpressionStatement())
                    .replaceWithMultiple(context.ToStatements())
            );
        });
    }

    GetContextList() {
        const graph = [];
        this.m_Transcriber.TraverseLocalContext((context, name) => {
            context.m_Refs.forEach(path => {
                const parent = path.findParent(
                    path =>
                        path.isFunctionDeclaration() ||
                        path.isFunctionExpression() ||
                        path.isExportDeclaration()
                ) as NodePath<FunctionDeclaration | FunctionExpression>;

                if (parent) {
                    graph.push([name, parent.node.id.name]);
                }
            });
        });
        const context_list = toposort(graph).filter(name =>
            this.m_Transcriber.GetLocalContext(name)
        );
        return context_list;
    }

    constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    }
}

export class ILocalContextPlugin implements IPlugin {
    Transcribe: () => void;
    GetContextList: () => Array<string>;
}
