import { ITranscriber } from "../core/transcriber";
import { NodePath, Node } from "@babel/core";
import { StringLiteral, Identifier } from "@babel/types";

export class InplaceContextPlugin {
    m_Transcriber: ITranscriber;
}

<InplaceContextPlugin /> +
    function constructor(this: InplaceContextPlugin, transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };

<InplaceContextPlugin /> +
    function Transcribe(this: InplaceContextPlugin) {
        const transcriber = this.m_Transcriber;
        transcriber.m_Module.Traverse({
            TaggedTemplateExpression(path) {
                const tag = path.get("tag");
                if (!tag.isCallExpression()) {
                    return;
                }

                const callee = tag.get("callee") as NodePath<Identifier>;
                const callee_name = callee.node.name as string;
                if (callee_name !== "context" && callee_name !== "Λ") {
                    return;
                }

                const [arg] = (tag.get("arguments") as Array<NodePath<Node>>) as [
                    NodePath<StringLiteral>
                ];
                const dsl_name = arg.node.value;

                const dsl = transcriber.m_DSLMap.get(dsl_name);
                if (!dsl) {
                    return;
                }

                path.replaceWith(dsl.InplaceTranscribe(path.get("quasi")));
            },
        });
    };
