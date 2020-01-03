import { ModuleCode } from "../../src/code-object/module";
import { ToString } from "../../src/common/utility";
import { Transcriber } from "../../src/core/transcriber";

describe("transcriber", () =>
{
    test("transcriber.preprocess", () =>
    {
        //
        const code = `
            export class Foo{
                static foo: number;
            }

            <Foo/> + function Test(this: Foo, a: number, b: string){
                return a.toString()+b;
            }

            function Bar(this: Foo, a: number, b: string){
                a += this.foo;
                return a.toString()+b;
            }
        `;

        const transcriber = new Transcriber(code);
        transcriber.Preprocess();

        expect(transcriber.m_ClassMap.size).toEqual(1);
        expect(transcriber.m_MethodMap.size).toEqual(1);
        expect(transcriber.m_ContextMap.size).toEqual(1);
    })

    test("transcriber.transcribe", () =>
    {
        //
        const code = `
            export class Foo{
                static foo: number;
            }

            <Foo/> + function Test(this: Foo, a: number, b: string){
                return a.toString()+b;
            };

            <Foo/> + function Test2(this: Foo, a: number, b: string){
                return a.toString()+b;
            }
        `;

        const transcriber = new Transcriber(code);
        transcriber.Transcribe();
        const result = transcriber.m_ClassMap.get("Foo").m_Code;
        expect(ToString(result)).toMatchSnapshot();
    })

    test("transcriber.interface-no-parse-error", () =>
    {
        //
        const code = `
            interface IFoo {

                // ; is not required after interface and before tag
            }

            <Foo/> + function Test(this: Foo, a: number, b: string){
                return a.toString()+b;
            }
        `;

        expect(() => new Transcriber(code)).not.toThrow();
    })
})