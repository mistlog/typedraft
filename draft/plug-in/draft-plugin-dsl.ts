import { ITranscriber } from "../core";
import { InlineContext, LocalContext } from "../code-object";

export class DSLPlugin {
    m_Transcriber: ITranscriber;

    constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    }

    Transcribe() {
        const ResolveDSL = (context: InlineContext | LocalContext) => {
            const dsl = this.m_Transcriber.GetDSL(context.GetDSLName());

            if (dsl) {
                context.Resolve(dsl);
            }
        };

        this.m_Transcriber.TraverseInlineContext(ResolveDSL);
        this.m_Transcriber.TraverseLocalContext(ResolveDSL);
    }
}
