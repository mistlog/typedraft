import { ExportNamedDeclaration, ClassDeclaration, ClassMethod } from "@babel/types";
import { NodePath } from "@babel/core";

export class ExportClassCode {
    m_Path: NodePath<ExportNamedDeclaration>;

    constructor(path: NodePath<ExportNamedDeclaration>) {
        this.m_Path = path;
    }

    get m_Code() {
        return this.m_Path.node;
    }

    get m_Class() {
        return this.m_Code.declaration as ClassDeclaration;
    }

    get m_Members() {
        return this.m_Class.body.body;
    }

    get m_Name() {
        return this.m_Class.id.name as string;
    }

    AddMember(member: ClassMethod) {
        this.m_Members.push(member);
    }
}
