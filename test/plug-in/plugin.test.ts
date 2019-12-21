import { ModuleCode } from "../../src/code-object/module";
import { Transcriber, IDSL } from "../../src/core/transcriber";
import { LocalContextPlugin } from "../../src/plug-in/draft-plugin-local-context";
import { ToAst, ToString } from "../../src/common/utility";
import { FilterPlugin } from "../../src/plug-in/draft-plugin-filter";
import { Statement } from "@babel/types";

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

describe("plugin.dsl",()=>{
    test("dsl.log", () =>
    {
        //
        class Foo implements IDSL
        {
            Transpile(block: Array<Statement>): Array<Statement>
            {

                const transpiled = ToAst(`
                    console.log("current");
                `);

                return [transpiled as Statement];
            }
        }

        //
        const code = `
            function Test(){
                'use foo';
                console.log("previous");
            }
        `;

        const transcriber = new Transcriber(code);
        transcriber.m_Plugins.pop();
        transcriber.AddDSL("foo", new Foo());
        const result = transcriber.Transcribe();

        //
        const expected = ToAst(`
            function Test(){
                console.log("current");
            }
        `);

        expect(ToAst(result)).toEqual(expected);
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
        transcriber.m_Plugins.pop();
        transcriber.AddPlugin(new FilterPlugin(transcriber));
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    })
})