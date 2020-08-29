export class FilterPlugin {
    m_Transcriber: ITranscriber;
}

<FilterPlugin /> +
    function constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };

<FilterPlugin /> +
    function Transcribe(this: FilterPlugin) {
        this.m_Transcriber.TraverseLocalContext(context => context.m_Path.remove());
        this.m_Transcriber.TraverseMethod(methods => methods.forEach(each => each.m_Path.remove()));
    };

import { ITranscriber } from "../core/transcriber";
