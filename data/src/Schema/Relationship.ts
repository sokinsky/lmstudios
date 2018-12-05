import { Type, Property, Constraint } from "./";
export class Relationship {
    constructor(constraint:Constraint, type:string, properties:string[]){
        this.Constraint = constraint;
        var referenceType = this.Constraint.Property.Type.Context.GetType(type);
        if (referenceType === undefined)
            throw new Error(`Reference.constructor():Type(${type}) does not exist in the context`);
        this.Type = referenceType;
        properties.forEach(propertyName=>{
            var property = this.Type.GetProperty(propertyName);
            if (property === undefined)
                throw new Error(`Reference.constructor():Type(${type}) does not contains a property(${propertyName})`)
            this.Properties.push(property);
        });
    }
    public Constraint:Constraint;
    public Type:Type;
    public Properties:Property[] = [];
}