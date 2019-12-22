# Class

All exported class would be recorded as ```ExportClassCode```,

```typescript
export class ExportClassCode {
    m_Code: ExportNamedDeclaration;
    get m_Class() {
        return this.m_Code.declaration as ClassDeclaration;
    }
    get m_Members() {
        return this.m_Class.body.body;
    }
    get m_Name() {
        return this.m_Class.id.name;
    }
}
```

Then, we will restore class methods and add them to class. See document of method.

```typescript
<ExportClassCode /> +
    function AddMember(this: ExportClassCode, member: ClassMethod) {
        this.m_Members.push(member);
    };
```

# Trivial

```typescript
<ExportClassCode /> +
    function constructor(this: ExportClassCode, node: ExportNamedDeclaration) {
        this.m_Code = node;
    };
```