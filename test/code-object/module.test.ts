import { ModuleCode, ExportClassCode, MethodCode, LocalContext } from "../../src";

describe("module", () => {
    test("to draft", () => {
        //
        const _module = new ModuleCode(`
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
        `);

        //
        const [export_class, method, local_context] = _module.ToDraft();
        expect(export_class instanceof ExportClassCode).toEqual(true);
        expect(method instanceof MethodCode).toEqual(true);
        expect(local_context instanceof LocalContext).toEqual(true);
    });

    test("normal function is not local context", () => {
        //
        const _module = new ModuleCode(`
            export class Foo{
                static foo: number;
            }

            <Foo/> + function Test(this: Foo, a: number, b: string){
                Bar();
                return a.toString()+b;
            };

            function Bar(this: Foo, a: number, b: string){
                a += this.foo;
                return a.toString()+b;
            }
        `);

        //
        const [export_class, method] = _module.ToDraft();
        expect(export_class instanceof ExportClassCode).toEqual(true);
        expect(method instanceof MethodCode).toEqual(true);
    });
});
