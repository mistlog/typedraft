import { ITranscriber } from "../core/transcriber";

export class DSLPlugin
{
    m_Transcriber: ITranscriber;
}

<DSLPlugin /> + function constructor(transcriber: ITranscriber)
{
    this.m_Transcriber = transcriber;
};

<DSLPlugin /> + function Transcribe(this: DSLPlugin)
{
    this.m_Transcriber.TraverseLocalContext(context =>
    {
        const context_name = context.GetContextName();
        const dsl = this.m_Transcriber.GetDSL(context_name);
        if (dsl)
        {
            context.Resolve(dsl);
        }
    })
}