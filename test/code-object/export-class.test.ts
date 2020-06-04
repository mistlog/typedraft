import { ExportClassCode, ToString, ToNodePath, MethodCode } from "../../src";
import { ExpressionStatement, ExportNamedDeclaration } from "@babel/types";

describe("export class", () => {
    test("add member", () => {
        //
        const export_class = new ExportClassCode(
            ToNodePath<ExportNamedDeclaration>(`
            export class Foo {
                static foo : number;
            }
        `)
        );

        const method = new MethodCode(
            ToNodePath<ExpressionStatement>(`
            <Foo/> + function Test(this: Foo, a: number, b: string){
                return a.toString()+b;
            }
        `)
        );

        //
        export_class.AddMember(method.ToClassMethod());
        expect(ToString(export_class.m_Code)).toMatchSnapshot();
    });
});
