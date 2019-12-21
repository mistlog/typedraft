import { ModuleCode } from "../../src/code-object/module";
import { ExportClassCode } from "../../src/code-object/export-class";
import { MethodCode } from "../../src/code-object/method";
import { LocalContext } from "../../src/code-object/local-context";

describe("module", () =>
{
    test("module.to-draft", () =>
    {
        //
        const code = `
            export class Foo{
                static foo: number;
            }

            <Foo/> + function Test(this: Foo, a: number, b: string){
                <Bar/>;
                return a.toString()+b;
            };

            function Bar(this: Foo, a: number, b: string){
                a += this.foo;
                return a.toString()+b;
            }
        `;

        const _module = new ModuleCode(code);
        const [export_class, method, local_context] = _module.ToDraft();

        expect(export_class instanceof ExportClassCode).toEqual(true);
        expect(method instanceof MethodCode).toEqual(true);
        expect(local_context instanceof LocalContext).toEqual(true);
    })
})