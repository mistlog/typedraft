import { ITranscriber } from "../core";

export class FilterPlugin {
    m_Transcriber: ITranscriber;

    constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    }

    Transcribe() {
        this.m_Transcriber.TraverseLocalContext(context => context.m_Path.remove());
        this.m_Transcriber.TraverseMethod(methods => methods.forEach(each => each.m_Path.remove()));
    }
}
