```typescript
export class RefreshDraftPlugin implements IPlugin {
    m_Transcriber: ITranscriber;
    constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    }
    Transcribe() {
        this.m_Transcriber.RefreshDraft();
    }
}
```