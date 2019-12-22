```typescript
export class DSLPlugin {
    m_Transcriber: ITranscriber;
}
```

```typescript
<DSLPlugin /> +
    function constructor(transcriber: ITranscriber) {
        this.m_Transcriber = transcriber;
    };
```

```typescript
<DSLPlugin /> +
    function Transcribe(this: DSLPlugin) {
        this.m_Transcriber.TraverseLocalContext(context => {
            const context_name = context.GetContextName();
            const dsl = this.m_Transcriber.GetDSL(context_name);
            if (dsl) {
                context.Resolve(dsl);
            }
        });
    };
```