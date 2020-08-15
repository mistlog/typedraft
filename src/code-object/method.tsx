/**
 * # Class Method
 * As we want to rearrange code in literate programming, we will seperate class method from class body.
 */
export class MethodCode {
    m_Path: NodePath<ExpressionStatement>;

    get m_Code() {
        return this.m_Path.node;
    }
    get m_Left() {
        return this.m_Expression.left as JSXElement;
    }
    get m_Right() {
        return this.m_Expression.right as FunctionExpression;
    }
    get m_Expression() {
        return this.m_Code.expression as BinaryExpression;
    }
    get m_ClassName() {
        return (this.m_Left.openingElement.name as JSXIdentifier).name;
    }
}

/**
 * The syntax will be:
 *
```ts
export class Foo {
}

<Foo/> + function Test(this: Foo, a: number, b: string) {
    return a.toString()+b;
}
```
 *
 * After transcription, we will restore `Foo` class to:
 *
```ts
export class Foo {
    static foo : number;
    Test(a: number, b: string) {
        return a.toString()+b;
    }
}
```
 * 
 * ## Restore: To Class Method
 */

<MethodCode /> +
    function ToClassMethod(this: MethodCode): ClassMethod {
        const { id, params: raw_params, body } = this.m_Right;

        /**
         * remove param "this":
         */
        const params = raw_params.filter(param => {
            if (isIdentifier(param) && param.name === "this") {
                return false;
            }
            return true;
        });
        const kind = id.name === "constructor" ? id.name : "method";

        const class_method = classMethod(kind, id, params, body);
        return class_method;
    };

/**
 * # Trivial
 */
<MethodCode /> +
    function constructor(this: MethodCode, path: NodePath<ExpressionStatement>) {
        this.m_Path = path;
    };

import {
    ExpressionStatement,
    BinaryExpression,
    JSXElement,
    FunctionExpression,
    JSXIdentifier,
    isIdentifier,
    classMethod,
    ClassMethod,
} from "@babel/types";
import { NodePath } from "@babel/traverse";
