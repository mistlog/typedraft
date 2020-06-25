import { MakeDefaultTranscriber, FilterPlugin, RefreshDraftPlugin } from "../../src";

test("filter class method & local context", () => {
    //
    const code = `
        export interface IFoo {
            foo: number;
        }

        export class Foo {

        }
        
        function Normal() {

        }

        // to be removed
        <Foo/> + function foo() {
            <Snippet/>;
        };

        function Snippet() {
            console.log("hi");
        }
    `;

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.m_Plugins = [new RefreshDraftPlugin(transcriber), new FilterPlugin(transcriber)];

    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});
