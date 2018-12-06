import { Type, Collection, Model } from "./";

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
    public Collection?:Collection;
    public Model?:Model;
    
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