import { ExportNamedDeclaration,ClassDeclaration, ClassMethod } from "@babel/types";
import { NodePath } from "@babel/core";

/*
# Class

All exported class would be recorded as ```ExportClassCode```,
*/
export class ExportClassCode
{
    m_Code: ExportNamedDeclaration;
    m_Path: NodePath<ExportNamedDeclaration>;

    get m_Class() { return this.m_Code.declaration as ClassDeclaration; }
    get m_Members() { return this.m_Class.body.body; }
    get m_Name() { return this.m_Class.id.name; }
}

/*
Then, we will restore class methods and add them to class. See document of method.
*/
<ExportClassCode /> + function AddMember(this: ExportClassCode, member: ClassMethod)
{
    this.m_Members.push(member);
};


/*
# Trivial
*/
<ExportClassCode /> + function constructor(this: ExportClassCode, node: ExportNamedDeclaration, path?: NodePath<ExportNamedDeclaration>)
{
    this.m_Code = node;
    this.m_Path = path;
};