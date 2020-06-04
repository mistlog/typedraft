import { MakeDefaultTranscriber, IDSL, ToAst } from "../../src";
import {
    Statement,
    FunctionDeclaration,
    labeledStatement,
    blockStatement,
    identifier,
} from "@babel/types";
import { NodePath } from "@babel/traverse";
import { PatternMatch } from "draft-dsl-match";

test("simple", () => {
    //
    class Foo implements IDSL {
        Transcribe(block: Array<Statement>): Array<Statement> {
            const transcribed = ToAst(`
                    console.log("current");
                `);

            return [transcribed as Statement];
        }
    }

    //
    const code = `
        export function Main(){
            <Test/>;
        }

        function Test(){
            'use foo';
            console.log("previous");
        }
    `;
    const transcriber = MakeDefaultTranscriber(code);
    transcriber.AddDSL("foo", new Foo());
    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});

/**
 * <TestLog/> is not used as local context, but after DSL "match" resolved,
 * it will be used as local context,
 * thus after DSL resolved, we need to refresh draft again.
 */
test("local context added after dsl resolved", () => {
    const code = `
            export function Main(){
                <TestMatch/>;
            }

            function TestMatch(value){
                "use match";

                (value: "a") => <TestLog/>;
            }

            function TestLog(){
                console.log("value is a");
            }
        `;

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.AddDSL("match", new PatternMatch());
    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});

test("nested dsl", () => {
    //
    class Watch implements IDSL {
        Transcribe(block: Array<Statement>): Array<Statement> {
            return [labeledStatement(identifier("$"), blockStatement(block))];
        }
    }

    //
    const code = `
            export function Main(){
                <Test/>;
            }

            function Test(value: number){
                "use watch";

                <Match/>;
                b = value + 1;
            }

            function Match(value){
                "use match";

                (value: "a") =>
                {
                    console.log("value is a");
                };
            }
        `;

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.AddDSL("watch", new Watch());
    transcriber.AddDSL("match", new PatternMatch());
    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});

test("use path param", () => {
    //
    class Foo implements IDSL {
        Transcribe(block: Array<Statement>, path: NodePath<FunctionDeclaration>): Array<Statement> {
            path.traverse({
                Identifier(path) {
                    if (path.node.name === "x") {
                        path.node.name = "y";
                    }
                },
            });

            return block;
        }
    }

    //
    const code = `
            export function Main(){
                <Test/>;
            }

            function Test(){
                'use foo';
                const x = 1;
                console.log(x + 1);
            }
        `;

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.AddDSL("foo", new Foo());
    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});
