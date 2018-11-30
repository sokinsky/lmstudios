import { Type, Constraint } from "./";

export class Property {
    constructor(type:Type, propertyData:string|{Name:string, PropertyType:string}){
        this.Type = type;  
        if (typeof(propertyData) == "string"){
            this.Name = propertyData;
        }   
        else{
            this.Name = propertyData.Name;
        }

    }
    public Type:Type;
    public Name:string;
    public PropertyType?:Type;
    
    // public get PropertyType():Type{
    //     if (this.__init.PropertyType === undefined)
    //         throw new Error(`Property(${this.Name}) is missing PropertyType`);
    //     var result = this.Type.Context.GetType(this.__init.PropertyType);
    //     if (result === undefined)
    //         result = new Type(this.Type.Context,  this.__init.Property);
    //     return result;
    // }
    // public get Constraints():Constraint[]|undefined {
    //     if (this.__init.Constraints === undefined)
    //         return undefined;
    //     var results:Constraint[] = [];
    //     this.__init.Constraints.forEach((constraintData:any) => {
    //         results.push(new Constraint(this, constraintData))

    //     });
    //     return results;
    // }

    public GetValue(item:any):any{
        if (item === undefined)
            return undefined;
        return item[this.Name];
    }
    public SetValue(item:any, value:any){
        if (item === undefined)
            return;
        item[this.Name] = value;
    }
}