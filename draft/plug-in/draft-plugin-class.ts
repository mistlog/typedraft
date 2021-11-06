import { ITranscriber } from "../core";

export class ClassPlugin {
    m_Transcriber: ITranscriber;

    constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    }

    Transcribe() {
        this.m_Transcriber.TraverseMethod((methods, class_name) =>
            methods.forEach(method =>
                this.m_Transcriber.GetClass(class_name).AddMember(method.ToClassMethod())
            )
        );
    }
}
