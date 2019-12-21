import { ExpressionStatement, BinaryExpression, JSXElement, FunctionExpression, JSXIdentifier, isIdentifier, classMethod, ClassMethod } from "@babel/types";

export interface IClassMethod
{
    class_name: string;
    method: ClassMethod;
}

export class MethodCode
{
    m_Code: ExpressionStatement;

    get m_Left() { return this.m_Expression.left as JSXElement; }
    get m_Right() { return this.m_Expression.right as FunctionExpression; }
    get m_Expression() { return this.m_Code.expression as BinaryExpression; }
    get m_ClassName () { return (this.m_Left.openingElement.name as JSXIdentifier).name; }
}

<MethodCode /> + function constructor(node: ExpressionStatement)
{
    this.m_Code = node;
};

<MethodCode /> + function ToClassMethod(this: MethodCode): IClassMethod
{
    const { id, params: raw_params, body } = this.m_Right;
    const params = raw_params.filter(param => isIdentifier(param) && param.name !== "this");
    const kind = id.name === "constructor" ? "constructor" : "method";

    const class_method = {
        class_name: this.m_ClassName,
        method: classMethod(kind, id, params, body)
    }

    return class_method;
}