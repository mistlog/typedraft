import { MakeDefaultTranscriber, RefreshDraftPlugin } from "../../src";

test("refresh draft", () => {
    const code = `
            export class Foo{
                static foo: number;
            }
    
            <Foo/> + function Test(this: Foo, a: number, b: string){
                <Bar/>;
                return a.toString()+b;
            }
    
            function Bar(this: Foo, a: number, b: string){
                a += this.foo;
                return a.toString()+b;
            }
    
            console.log("not draft, ignore this statement");
        `;

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.m_Plugins = [new RefreshDraftPlugin(transcriber)];
    transcriber.Transcribe();

    expect(transcriber.m_ClassMap.size).toEqual(1);
    expect(transcriber.m_MethodMap.size).toEqual(1);
    expect(transcriber.m_ContextMap.size).toEqual(1);
});
