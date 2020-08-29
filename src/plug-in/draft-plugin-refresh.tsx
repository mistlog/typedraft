export class RefreshDraftPlugin {
    m_Transcriber: ITranscriber;
}

<RefreshDraftPlugin /> +
    function Transcribe(this: RefreshDraftPlugin) {
        /**
         * clear
         */
        this.m_Transcriber.m_ClassMap.clear();
        this.m_Transcriber.m_MethodMap.clear();
        this.m_Transcriber.m_ContextMap.clear();
        this.m_Transcriber.m_InlineContextMap.clear();

        /**
         * prepare draft
         */
        const draft = this.m_Transcriber.m_Module.ToDraft();
        draft.forEach(
            each => Λ("match")` ${
                each as ExportClassCode | LocalContext | InlineContext | MethodCode
            }
            ${each instanceof ExportClassCode} -> ${(each: ExportClassCode) => {
                this.m_Transcriber.m_ClassMap.set(each.m_Name, each);
            }}

            ${each instanceof LocalContext} -> ${(each: LocalContext) => {
                this.m_Transcriber.m_ContextMap.set(each.m_Name, each);
            }}

            ${each instanceof InlineContext} -> ${(each: InlineContext) => {
                this.m_Transcriber.m_InlineContextMap.set(each.m_ID, each);
            }}
            
            ${each instanceof MethodCode} -> ${(each: MethodCode) => {
                const class_name = each.m_ClassName;
                const methods = this.m_Transcriber.m_MethodMap.get(class_name) ?? [];
                this.m_Transcriber.m_MethodMap.set(class_name, [...methods, each]);
            }}
        `
        );
    };

<RefreshDraftPlugin /> +
    function constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };

import { ITranscriber } from "../core/transcriber";
import { ExportClassCode } from "../code-object/export-class";
import { MethodCode } from "../code-object/method";
import { LocalContext } from "../code-object/local-context";
import { InlineContext } from "../code-object/inline-context";
import { MatchDSL } from "draft-dsl-match";
