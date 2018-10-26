import { Attributes, Type } from "./";

export class Property {
    constructor(name:string, type:Type){
        this.Name = name;
        this.Type = type;
    }
    public Name:string;
    public Type: Type;
    public Attributes?:Attributes;

    public GetValue(item:any):any{
        return item[this.Name];
    }
    public SetValue(item:any, value:any){
        item[this.Name] = value;
    }
}
export class Properties {
    public Items:Property[] = [];

    public filter(by:string|Type):Property[] {
        switch (typeof(by)){
            case "string":
                return this.Items.filter((property:Property)=>{
                    return property.Name === by;
                })       
            case "object":
                return this.Items.filter((property:Property)=>{
                    return property.Type === by;
                })                 
            default:
                return [];
        }

    }
    public find(name:string):Property|undefined{
        return this.Items.find((property:Property)=>{
            return property.Name === name;
        });
    }

    public Add(name:string, type:Type):Property {
        var result = this.find(name);
        if (! result){
            result = new Property(name, type);
            this.Items.push(result);
        }
        return result;
    }

}