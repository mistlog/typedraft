import { IPlugin, ITranscriber } from "../core/transcriber";
import { ExportClassCode } from "../code-object/export-class";
import { MethodCode } from "../code-object/method";
import { LocalContext } from "../code-object/local-context";

export class RefreshDraftPlugin implements IPlugin {
    m_Transcriber: ITranscriber;

    constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    }

    Transcribe() {
        /**
         * clear
         */
        this.m_Transcriber.m_ClassMap.clear();
        this.m_Transcriber.m_MethodMap.clear();
        this.m_Transcriber.m_ContextMap.clear();

        /**
         * prepare draft
         */
        const draft = this.m_Transcriber.m_Module.ToDraft();
        draft.forEach(each => {
            if (each instanceof ExportClassCode) {
                this.m_Transcriber.m_ClassMap.set(each.m_Name, each);
            } else if (each instanceof MethodCode) {
                const class_name = each.m_ClassName;
                const methods = this.m_Transcriber.m_MethodMap.get(class_name);
                methods
                    ? methods.push(each)
                    : this.m_Transcriber.m_MethodMap.set(class_name, [each]);
            } else if (each instanceof LocalContext) {
                this.m_Transcriber.m_ContextMap.set(each.m_Name, each);
            }
        });
    }
}
