import { Transcriber, ITranscriber } from "../core/transcriber";
import { isExpressionStatement, isFunctionDeclaration } from "@babel/types";

export class FilterPlugin
{
    m_Transcriber: ITranscriber;
}

<FilterPlugin /> + function constructor(transcriber: ITranscriber)
{
    this.m_Transcriber = transcriber;
};

<FilterPlugin /> + function Transcribe(this: FilterPlugin)
{
    this.m_Transcriber.m_Code = this.m_Transcriber.m_Code.filter(
        each => !isExpressionStatement(each) && !isFunctionDeclaration(each)
    );
}