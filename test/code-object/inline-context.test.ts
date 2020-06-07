import { ToNodePath, ToAst, InlineContext } from "../../src";
import { Statement } from "@babel/types";

test("get context name", () => {
    const context = new InlineContext(
        ToNodePath(`
        {
            'use foo';
            console.log("previous");
        }
    `)
    );
    expect(context.GetContextName()).toEqual("foo");
});

test("to statement", () => {
    //
    const context = new InlineContext(
        ToNodePath(`
        {
            'use foo';
            console.log("previous");
        }
    `)
    );

    //
    const expected = ToAst<Array<Statement>>(`
        'use foo';
        console.log("previous");
    `);
    expect(context.ToStatements()).toEqual(expected);
});
