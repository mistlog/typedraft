import { ITranscriber } from "../core/transcriber";
import { InlineContext } from "../code-object/inline-context";
import { LocalContext } from "../code-object/local-context";

export class DSLPlugin {
    m_Transcriber: ITranscriber;
}

<DSLPlugin /> +
    function constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };

<DSLPlugin /> +
    function Transcribe(this: DSLPlugin) {
        const ResolveDSL = (context: InlineContext | LocalContext) =>
            context.Resolve(this.m_Transcriber.GetDSL(context.GetDSLName()));
        this.m_Transcriber.TraverseInlineContext(ResolveDSL);
        this.m_Transcriber.TraverseLocalContext(ResolveDSL);
    };
