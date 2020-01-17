import { ModuleCode } from "../../src/code-object/module";
import { Transcriber, IDSL } from "../../src/core/transcriber";
import { LocalContextPlugin } from "../../src/plug-in/draft-plugin-local-context";
import { ToAst, ToString } from "../../src/common/utility";
import { FilterPlugin } from "../../src/plug-in/draft-plugin-filter";
import { Statement, FunctionDeclaration } from "@babel/types";
import { NodePath } from "@babel/traverse";

describe("plugin.local-context", () =>
{
    test("transcribe.simple", () =>
    {
        //
        const code = `
            <Foo/> + function Test(this: Foo, a: number, b: string){
                <Snippet/>;
                return a.toString()+b;
            };

            function Snippet(){
                console.log("hi");
            }
        `;

        const transcriber = new Transcriber(code);

        // remove last filter plugin from default transcriber
        transcriber.m_Plugins.pop();
        const plugin = transcriber.m_Plugins.find(plugin => plugin instanceof LocalContextPlugin);
        Reflect.set(plugin, "GetContextList", () => ["Snippet"]);

        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    })
    test("transcribe.nested", () =>
    {
        //
        const code = `
            <Foo/> + function Test(this: Foo, a: number, b: string){
                <Snippet/>;
                return a.toString()+b;
            };

            function Snippet(){
                console.log("hi");
                <SnippetNested/>;
            }

            function SnippetNested(){
                console.log("nested");
            }
        `;

        const transcriber = new Transcriber(code);
        transcriber.m_Plugins.pop();
        const plugin = transcriber.m_Plugins.find(plugin => plugin instanceof LocalContextPlugin);
        Reflect.set(plugin, "GetContextList", () => ["SnippetNested", "Snippet"]);

        const result = transcriber.Transcribe();;
        expect(result).toMatchSnapshot();
    })


    test("transcribe.integrated.export-function", () =>
    {
        //
        const code = `
            export function Test(a: number, b: string){
                <Snippet/>;
                return a.toString()+b;
            };

            function Snippet(){
                console.log("export function");
            }
        `;

        const transcriber = new Transcriber(code);
        transcriber.m_Plugins.pop();
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    })

    test("integrated.method", () =>
    {
        //
        const code = `
            <Foo/> + function Test(this: Foo, a: number, b: string){
                <Snippet/>;
                <AnotherSnippet/>;
                return a.toString()+b;
            };

            function Snippet(){
                console.log("hi");
                <SnippetNested/>;
            }

            function AnotherSnippet(){
                console.log("another");
                <SnippetNested/>;
            }

            function SnippetNested(){
                console.log("nested");
                <DeepSnippet/>;
            }

            function DeepSnippet(){
                console.log("deep");
            }
        `;

        const transcriber = new Transcriber(code);
        transcriber.m_Plugins.pop();
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    })

    test("get-context-list.simple", () =>
    {
        //
        const code = `
            <Foo/> + function Test(this: Foo, a: number, b: string){
                <Snippet/>;
                return a.toString()+b;
            };

            function Snippet(){
                console.log("hi");
            }
        `;

        const transcriber = new Transcriber(code);
        const plugin = transcriber.m_Plugins.find(plugin => plugin instanceof LocalContextPlugin) as LocalContextPlugin;
        const context_list = plugin.GetContextList();
        expect(context_list).toEqual(["Snippet"]);
    })

    test("get-context-list.nested", () =>
    {
        //
        const code = `
            <Foo/> + function Test(this: Foo, a: number, b: string){
                <Snippet/>;
                <AnotherSnippet/>;
                return a.toString()+b;
            };

            function Snippet(){
                console.log("hi");
                <SnippetNested/>;
            }

            function AnotherSnippet(){
                console.log("another");
                <SnippetNested/>;
            }

            function SnippetNested(){
                console.log("nested");
                <DeepSnippet/>;
            }

            function DeepSnippet(){
                console.log("deep");
            }
        `;

        const transcriber = new Transcriber(code);
        transcriber.m_Plugins.pop();
        const plugin = transcriber.m_Plugins.find(plugin => plugin instanceof LocalContextPlugin) as LocalContextPlugin;
        const context_list = plugin.GetContextList();
        expect(context_list).toEqual(["DeepSnippet", "SnippetNested", "Snippet", "AnotherSnippet"]);
    })
})

describe("plugin.dsl", () =>
{
    test("dsl.log", () =>
    {
        //
        class Foo implements IDSL
        {
            Transcribe(block: Array<Statement>): Array<Statement>
            {

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

        const transcriber = new Transcriber(code);
        transcriber.AddDSL("foo", new Foo());
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    })

    test("dsl.rename.test-use-path", () =>
    {
        //
        class Foo implements IDSL
        {
            Transcribe(block: Array<Statement>, path: NodePath<FunctionDeclaration>): Array<Statement>
            {

                path.traverse({
                    Identifier(path)
                    {
                        if (path.node.name === "x")
                        {
                            path.node.name = "y";
                        }
                    }
                })

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

        const transcriber = new Transcriber(code);
        transcriber.AddDSL("foo", new Foo());
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    })
})

describe("plugin.filter", () =>
{
    test("filter", () =>
    {
        //
        const code = `
            export interface IFoo{
                foo: number;
            }

            export class Foo{

            }

            <Foo/> + function foo(){
                <Snippet/>;
            };

            function Snippet(){
                console.log("hi");
            }
        `;

        const transcriber = new Transcriber(code);
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    })

    test("filter local context", () =>
    {
        //
        const code = `
            export interface IFoo{
                foo: number;
            }

            export class Foo{

            }

            <Foo/> + function foo(){
                <Snippet/>;
            };

            function Snippet(){
                // removed from output
                console.log("hi");
            }

            function Normal(){
                // remain in output
            }
        `;

        const transcriber = new Transcriber(code);
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    })
})