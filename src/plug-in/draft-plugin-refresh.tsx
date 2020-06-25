import { ITranscriber } from "../core/transcriber";
import { ExportClassCode } from "../code-object/export-class";
import { MethodCode } from "../code-object/method";
import { LocalContext } from "../code-object/local-context";
import { InlineContext } from "../code-object/inline-context";

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
        draft.forEach(each => {
            {
                "use match";
                (each: ExportClassCode) => this.m_Transcriber.m_ClassMap.set(each.m_Name, each);
                (each: LocalContext) => this.m_Transcriber.m_ContextMap.set(each.m_Name, each);
                (each: InlineContext) => this.m_Transcriber.m_InlineContextMap.set(each.m_ID, each);
                (each: MethodCode) => {
                    const class_name = each.m_ClassName;
                    const methods = this.m_Transcriber.m_MethodMap.get(class_name);
                    methods
                        ? methods.push(each)
                        : this.m_Transcriber.m_MethodMap.set(class_name, [each]);
                };
            }
        });
    };

<RefreshDraftPlugin /> +
    function constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };
