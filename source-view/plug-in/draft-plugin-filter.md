```typescript
export class FilterPlugin {
    m_Transcriber: ITranscriber;
}
```

```typescript
<FilterPlugin /> +
    function constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };
```

```typescript
<FilterPlugin /> +
    function Transcribe(this: FilterPlugin) {
        this.m_Transcriber.m_Code = this.m_Transcriber.m_Code.filter(each => !isExpressionStatement(each) && !isFunctionDeclaration(each));
    };
```