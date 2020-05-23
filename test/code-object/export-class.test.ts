import { ExportClassCode } from "../../src/code-object/export-class";
import { ToAst, ToString } from "../../src/common/utility";
import { MethodCode } from "../../src/code-object/method";
import { ExpressionStatement, ExportNamedDeclaration } from "@babel/types";

describe("export class", () => {
    test("export-class.add-member", () => {
        //
        const class_code = `
            export class Foo {
                static foo : number;
            }
        `;

        const raw = ToAst(class_code) as ExportNamedDeclaration;
        const export_class = new ExportClassCode(raw);

        //
        const method_code = `
            <Foo/> + function Test(this: Foo, a: number, b: string){
                return a.toString()+b;
            }
        `;

        const method = new MethodCode(ToAst(method_code) as ExpressionStatement);
        const class_method = method.ToClassMethod();

        //
        export_class.AddMember(class_method);
        expect(ToString(export_class.m_Code)).toMatchSnapshot();
    });
});
