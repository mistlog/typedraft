import { MakeDefaultTranscriber, IDSL, InplaceContextPlugin } from "../../src";
import { NodePath } from "@babel/core";
import { TemplateLiteral, stringLiteral } from "@babel/types";

class Math implements IDSL {
    InplaceTranscribe(literal: NodePath<TemplateLiteral>, type: string) {
        return stringLiteral("3" + type);
    }
}

test("use inplace context as expression", () => {
    //
    const code = `
        const temp = Λ<number>("math")\`
            1+2
        \`;
    `;

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.m_Plugins = [new InplaceContextPlugin(transcriber)];
    transcriber.m_DSLMap.set("math", new Math());
    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});

test("use inplace context as expression statement", () => {
    //
    const code = `
        context("math")\`
            1+2
        \`;
    `;

    const transcriber = MakeDefaultTranscriber(code);
    transcriber.m_Plugins = [new InplaceContextPlugin(transcriber)];
    transcriber.m_DSLMap.set("math", new Math());
    const result = transcriber.Transcribe();
    expect(result).toMatchSnapshot();
});

describe("not inplace context", () => {
    test("not call expression", () => {
        //
        const code = `
            context<number>\`
                1+2
            \`;
        `;

        const transcriber = MakeDefaultTranscriber(code);
        transcriber.m_Plugins = [new InplaceContextPlugin(transcriber)];
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    });

    test("not context or Λ", () => {
        //
        const code = `
            whatever<number>("math")\`
                1+2
            \`;
        `;

        const transcriber = MakeDefaultTranscriber(code);
        transcriber.m_Plugins = [new InplaceContextPlugin(transcriber)];
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    });

    test("no dsl", () => {
        //
        const code = `
            const temp = Λ<number>("math")\`
                1+2
            \`;
        `;

        const transcriber = MakeDefaultTranscriber(code);
        transcriber.m_Plugins = [new InplaceContextPlugin(transcriber)];
        const result = transcriber.Transcribe();
        expect(result).toMatchSnapshot();
    });
});
