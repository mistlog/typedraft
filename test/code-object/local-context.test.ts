import { LocalContext } from "../../src/code-object/local-context";
import { ToAst } from "../../src/common/utility";
import { FunctionDeclaration, Statement } from "@babel/types";

describe("local context", () =>
{
    test("local-context", () =>
    {
        //
        const code = `
            function Test(this: Foo, a: number, b: string){
                a += this.foo;
                return a.toString()+b;
            }
        `;

        const raw = ToAst(code) as FunctionDeclaration;
        const context = new LocalContext(raw);
        const block = context.ToStatements();

        //
        const expected = ToAst(`
            a += this.foo;
            return a.toString()+b;
        `) as Array<Statement>;

        expect(block).toEqual(expected);
    })

    test("local-context.name", () =>
    {
        //
        const code = `
            function Test(value:number){
                'use match';
            }
        `;

        const raw = ToAst(code) as FunctionDeclaration;
        const context = new LocalContext(raw);
        const context_name = context.GetContextName();
        expect(context_name).toEqual("match");
    })
})