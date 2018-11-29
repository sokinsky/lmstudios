import { Type, Property, Constraint } from "./";
export class Reference {
    constructor(constraint:Constraint, init:any){
        this.__init = init;
        this.Constraint = constraint;
    }
    private __init:any;
    public Constraint:Constraint;


    public get Type():Type{
        return this.Constraint.Property.Type.Context.GetType(this.__init.Type);
    }
    public Properties():Property[] {
        var results:Property[] = [];
        this.__init.Properties.forEach((propertyName:any) => {
            var result = this.Type.GetProperty(propertyName);
            if (result !== undefined)
                results.push(result);
        });
        return results;
    };
}