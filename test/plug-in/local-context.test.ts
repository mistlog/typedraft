import { MakeDefaultTranscriber, LocalContextPlugin, RefreshDraftPlugin } from "../../src";

test("get context list: simple", () => {
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

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.m_Plugins = [new RefreshDraftPlugin(transcriber)];
    transcriber.Transcribe();

    const plugin = new LocalContextPlugin(transcriber);
    const context_list = plugin.GetContextList();
    expect(context_list).toEqual(["Snippet"]);
});

test("get context list: nested", () => {
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

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.m_Plugins = [new RefreshDraftPlugin(transcriber)];
    transcriber.Transcribe();

    const plugin = new LocalContextPlugin(transcriber);
    const context_list = plugin.GetContextList();
    expect(context_list).toEqual(["DeepSnippet", "SnippetNested", "Snippet", "AnotherSnippet"]);
});

test("transcribe: simple", () => {
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

    const transcriber = MakeDefaultTranscriber(code);
    const plugin = new LocalContextPlugin(transcriber);
    Reflect.set(plugin, "GetContextList", () => ["Snippet"]);
    transcriber.m_Plugins = [new RefreshDraftPlugin(transcriber), plugin];

    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});

test("transcribe: nested", () => {
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

    const transcriber = MakeDefaultTranscriber(code);
    const plugin = new LocalContextPlugin(transcriber);
    Reflect.set(plugin, "GetContextList", () => ["SnippetNested", "Snippet"]);
    transcriber.m_Plugins = [new RefreshDraftPlugin(transcriber), plugin];

    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});

test("transcribe: export function", () => {
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

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.m_Plugins = [
        new RefreshDraftPlugin(transcriber),
        new LocalContextPlugin(transcriber),
    ];

    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});

test("transcribe: method", () => {
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

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.m_Plugins = [
        new RefreshDraftPlugin(transcriber),
        new LocalContextPlugin(transcriber),
    ];

    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});
