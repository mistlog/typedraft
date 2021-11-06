import { ITranscriber } from "../core";
import { ToString } from "../common";
import { MatchDSL, when, __, use } from "draft-dsl-match";

export class InplaceContextPlugin {
    m_Transcriber: ITranscriber;

    constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    }

    Transcribe(this: InplaceContextPlugin) {
        const transcriber = this.m_Transcriber;
        transcriber.m_Module.Traverse({
            TaggedTemplateExpression(path) {
                Λ("match")` ${path.node} 
                    ${{
                        tag: {
                            type: "CallExpression",
                            typeParameters: use("typeParams"),
                            arguments: use("args"),
                            callee: {
                                type: "Identifier",
                                name: when(name => name === "context" || name === "Λ"),
                            },
                        },
                    }} -> ${(_, { args, typeParams }) => {
                    const dsl = transcriber.m_DSLMap.get(args[0].value);
                    if (dsl) {
                        const type = typeParams ? ToString(typeParams.params[0]) : "";
                        path.replaceWith(dsl.InplaceTranscribe(path.get("quasi"), type));
                    }
                }}

                    ${__} -> ${() => {}}
                `;
            },
        });
    }
}
