import { ITranscriber } from "../core/transcriber";

export class ClassPlugin {
    m_Transcriber: ITranscriber;
}

<ClassPlugin /> +
    function constructor(this: ClassPlugin, transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };

<ClassPlugin /> +
    function Transcribe(this: ClassPlugin) {
        this.m_Transcriber.TraverseMethod((methods, class_name) =>
            methods.forEach(method =>
                this.m_Transcriber.GetClass(class_name).AddMember(method.ToClassMethod())
            )
        );
    };
