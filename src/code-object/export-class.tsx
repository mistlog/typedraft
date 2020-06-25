/**
 * # Export Class
 * Exported class will be represented as `ExportClassCode`:
 */
export class ExportClassCode {
    m_Path: NodePath<ExportNamedDeclaration>;

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
}

/**
 * ## AddMember
 */
<ExportClassCode /> +
    function AddMember(this: ExportClassCode, member: ClassMethod) {
        this.m_Members.push(member);
    };

/**
 * # Trivial
 */
<ExportClassCode /> +
    function constructor(this: ExportClassCode, path: NodePath<ExportNamedDeclaration>) {
        this.m_Path = path;
    };

import { ExportNamedDeclaration, ClassDeclaration, ClassMethod } from "@babel/types";
import { NodePath } from "@babel/core";
