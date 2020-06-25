import { ToString, MakeDefaultTranscriber } from "../../src";

test("transcribe", () => {
    const code = `
            export class Foo{
                static foo: number;
            }

            <Foo/> + function constructor(){
                console.log("hi");
            };

            <Foo/> + function Test(this: Foo, a: number, b: string){
                return a.toString()+b;
            };
        `;

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.Transcribe();
    const result = transcriber.m_ClassMap.get("Foo").m_Code;
    expect(ToString(result)).toMatchSnapshot();
});

// see src/common/utility.ts ToFile comment
test("no parse error ", () => {
    // indent matters here, ";" is added before < at the beginning of line
    const code = `
interface IFoo {

    // ; is not required after interface and before tag
}

// comment
<Foo/> + function Test(this: Foo, a: number, b: string){
    return a.toString()+b;
}
        `;

    expect(() => MakeDefaultTranscriber(code)).not.toThrow();
});
