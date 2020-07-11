import { ToNodePath, ToAst, InlineContext } from "../../src";
import { Statement } from "@babel/types";

test("get dsl name", () => {
    const context = new InlineContext(
        ToNodePath(`
        {
            'use foo';
            console.log("previous");
        }
    `)
    );
    expect(context.GetDSLName()).toEqual("foo");
});

test("get dsl name: empty", () => {
    const context = new InlineContext(
        ToNodePath(`
        {
            console.log("previous");
        }
    `)
    );
    expect(context.GetDSLName()).toEqual("");
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
