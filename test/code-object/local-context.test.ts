import { LocalContext, ToAst, ToBinding } from "../../src";
import { Statement } from "@babel/types";

describe("local context", () => {
    test("to statement", () => {
        //
        const context = new LocalContext(
            ToBinding(`
            function Test(this: Foo, a: number, b: string){
                a += this.foo;
                return a.toString()+b;
            }
        `)
        );

        //
        const expected = ToAst<Array<Statement>>(`
            a += this.foo;
            return a.toString()+b;
        `);
        expect(context.ToStatements()).toEqual(expected);
    });

    test("get dsl name: empty", () => {
        const context = new LocalContext(
            ToBinding(`
            function Test(value:number){
            }
        `)
        );
        expect(context.GetDSLName()).toEqual("");
    });

    test("get dsl name", () => {
        const context = new LocalContext(
            ToBinding(`
            function Test(value:number){
                'use match';
            }
        `)
        );
        expect(context.GetDSLName()).toEqual("match");
    });
});
