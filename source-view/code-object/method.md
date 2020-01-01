# Class Method

As we want to rearrange code in literate programming, we will seperate class method from class body.

```typescript
export class MethodCode {
    m_Code: ExpressionStatement;
    m_Path: NodePath<ExpressionStatement>;
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
```

The syntax would be:

```typescript
export class Foo {
    static foo : number;
}

<Foo/> + function Test(this: Foo, a: number, b: string){
    return a.toString()+b;
}
```

After transcribe, we will restore ```Foo``` class as:

```typescript
export class Foo {
    static foo : number;
    Test(a: number, b: string){
        return a.toString()+b;
    }
}
```

## How to Restore

As described, "\<Foo/> + function Test" is an ```ExpressionStatement```, and we want to extrac infomation in order to restore class method.

```typescript
<MethodCode /> +
    function ToClassMethod(this: MethodCode): IClassMethod {
        const { id, params: raw_params, body } = this.m_Right;

        // remove "this" param
        const params = raw_params.filter(param => isIdentifier(param) && param.name !== "this");
        const kind = id.name === "constructor" ? "constructor" : "method";
        const class_method = { class_name: this.m_ClassName, method: classMethod(kind, id, params, body) };
        return class_method;
    };
```

We can get the "restored" class method now, but we have to find a way to insert it into class. See export-class.

# Trivial

```typescript
export interface IClassMethod {
    class_name: string;
    method: ClassMethod;
}
```

```typescript
<MethodCode /> +
    function constructor(this: MethodCode, node: ExpressionStatement, path?: NodePath<ExpressionStatement>) {
        this.m_Code = node;
        this.m_Path = path;
    };
```