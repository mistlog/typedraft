import { Identifier, TypeAnnotation, isTSLiteralType, IfStatement, BlockStatement, StringLiteral, NumberLiteral, isTSTypeReference, ArrowFunctionExpression, Statement, isArrowFunctionExpression, ExpressionStatement, ifStatement } from "@babel/types";
import { ToAst, ToString } from "../common/utility";

export class PatternMatch
{

}

<PatternMatch /> + function Transcribe(block: Array<ExpressionStatement>): [IfStatement]
{
    let tail: IfStatement = null;
    let head: IfStatement = null;

    block.forEach(each =>
    {
        const expression = each.expression as ArrowFunctionExpression;

        //@ts-ignore
        <TranscribeExpressionToIf />;
    })


    /**
     * transcribed is the "head"(first) of if statement
     */
    return [head];
}

function TranscribeExpressionToIf(expression: ArrowFunctionExpression, head: IfStatement, tail: IfStatement)
{
    if (expression.params.length === 0)
    {
        //@ts-ignore
        <HandleDefaultCase />
    }
    else
    {
        //@ts-ignore
        <BuildCurrentIf />;

        //@ts-ignore
        <MoveToNext />;
    }
}

function BuildCurrentIf(expression: ArrowFunctionExpression)
{
    //
    const [pattern_info] = expression.params as [Identifier];
    const to_match = pattern_info.name;
    const annotation = (pattern_info.typeAnnotation as TypeAnnotation).typeAnnotation;

    //
    let current: IfStatement = null;

    if (isTSLiteralType(annotation))
    {
        /**
         * number or string
         */
        type Literal = (StringLiteral | NumberLiteral) & { extra: { raw: string } };
        const pattern = (annotation.literal as Literal).extra.raw;
        current = ToAst(`if(${to_match}===${pattern}){}`) as IfStatement;
    }
    else if (isTSTypeReference(annotation))
    {
        /**
         * enum
         */
        current = ToAst(`if(${to_match}===${ToString(annotation)}){}`) as IfStatement;
    }

    current.consequent = expression.body as BlockStatement;
}

function MoveToNext(head: IfStatement, current: IfStatement, tail: IfStatement)
{
    if (head == null)
    {
        head = tail = current;
    }
    else
    {
        tail = tail.alternate = current;
    }

}


function HandleDefaultCase(expression: ArrowFunctionExpression, tail: IfStatement)
{
    tail.alternate = expression.body as BlockStatement;
}