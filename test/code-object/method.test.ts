import { MethodCode, ToString, ToNodePath } from "../../src";
import { ExpressionStatement } from "@babel/types";

describe("method", () => {
    test("to class method", () => {
        const method = new MethodCode(
            ToNodePath<ExpressionStatement>(`
            <Foo/> + function Test(this: Foo, a: number, b: string){
                return a.toString()+b;
            }
        `)
        );

        expect(ToString(method.ToClassMethod())).toMatchSnapshot();
        expect(method.m_ClassName).toEqual("Foo");
    });
});
