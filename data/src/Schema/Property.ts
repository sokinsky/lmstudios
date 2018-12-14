import { Type } from "../Type";
import { Context, Model } from "./";

export class Property {
    constructor(model:Model, name:string){
        this.Model = model; 
        this.Name = name;
        this.PropertyType = new Type("any");
    }
    public Initialize(type:string, relationship?:{ [name:string]:string }, references?:string) {  
   
        var propertyType = Type.GetType(type);
        if (propertyType === undefined)
            propertyType = Type.Create(type);
        this.PropertyType = propertyType;

        if (references !== undefined){
            this.References = [];
            for (var dataReference of references){
                var referenceProperty = this.Model.GetProperty(dataReference);
                if (referenceProperty === undefined)
                    throw new Error(``);
                this.References.push(referenceProperty);
            }
        }
        if (relationship !== undefined){
            this.Relationship = {};
            for (var name in relationship){
                var parentProperty = this.Model.GetProperty(name);
                if (parentProperty !== undefined){
                    if (this.ModelType !== undefined){
                        var childProperty = this.ModelType.GetProperty(relationship[name]);
                        if (childProperty !== undefined)
                            this.Relationship[name] = childProperty;                       
                    }  
                }
              
            }                    
        }
        
    }
    public Model:Model;
    public Name:string;
    public PropertyType:Type;
    public ModelType?:Model;
    public Relationship?:{[name:string]:Property};
    public References?:Property[];
    
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