import { Type, Property, Relationship } from ".";

export enum ReferenceType { Key="Key", Model="Model", Collection="Collection" }
export class Reference {
    constructor(parent:Property, data:{ Type:ReferenceType, Relationship:any }) { 
        this.Parent = parent;  
        this.Type = data.Type;
        this.Relationship = new Relationship(this, data.Relationship);
    }

    public Parent:Property;
    public Type:ReferenceType;
    public Relationship:Relationship;
}