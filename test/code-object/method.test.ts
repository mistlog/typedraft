import { MethodCode } from "../../src/code-object/method";
import { ToAst, ToString } from "../../src/common/utility";
import { ExpressionStatement } from "@babel/types";

describe("method", () => {
    test("method.to-class-method", () => {
        const code = `
            <Foo/> + function Test(this: Foo, a: number, b: string){
                return a.toString()+b;
            }
        `;

        const method = new MethodCode(ToAst(code) as ExpressionStatement);
        const class_method = method.ToClassMethod();

        expect(ToString(class_method)).toMatchSnapshot();
        expect(method.m_ClassName).toEqual("Foo");
    });
});
