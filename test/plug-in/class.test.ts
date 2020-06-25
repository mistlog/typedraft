import { MakeDefaultTranscriber, RefreshDraftPlugin, ClassPlugin } from "../../src";

test("transcribe class", () => {
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
    transcriber.m_Plugins = [new RefreshDraftPlugin(transcriber), new ClassPlugin(transcriber)];
    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});
