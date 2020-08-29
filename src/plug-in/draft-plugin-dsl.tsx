export class DSLPlugin {
    m_Transcriber: ITranscriber;
}

<DSLPlugin /> +
    function constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };

<DSLPlugin /> +
    function Transcribe(this: DSLPlugin) {
        const ResolveDSL = (context: InlineContext | LocalContext) => {
            const dsl = this.m_Transcriber.GetDSL(context.GetDSLName());
            /**
             * DSL name can be "" in local context, then dsl will be undefined
             */
            if (dsl) {
                context.Resolve(dsl);
            }
        };
        this.m_Transcriber.TraverseInlineContext(ResolveDSL);
        this.m_Transcriber.TraverseLocalContext(ResolveDSL);
    };

import { ITranscriber } from "../core/transcriber";
import { InlineContext } from "../code-object/inline-context";
import { LocalContext } from "../code-object/local-context";
