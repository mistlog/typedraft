import { ITranscriber } from "../core/transcriber";

export class ClassPlugin
{
    m_Transcriber: ITranscriber;
}

<ClassPlugin /> + function constructor(this: ClassPlugin, transcriber: ITranscriber)
{
    this.m_Transcriber = transcriber;
};

<ClassPlugin /> + function Transcribe(this: ClassPlugin)
{
    const transcriber = this.m_Transcriber;

    transcriber.TraverseMethod((methods, class_name) =>
    {
        const target_class = transcriber.GetClass(class_name);
        if (target_class)
        {
            methods.forEach(method => target_class.AddMember(method.ToClassMethod()));
        }
    })
}