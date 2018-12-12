import { Type } from "./";

export class Property {
    constructor(parent:Type, name:string){
        this.Parent = parent;  
        this.Name = name;
    }
    public Initialize(data:{ Name:string, Type:string, Relationship?:{ [name:string]:string }, References?:string }){        
        this.Type = this.Parent.Context.GetType(data.Type);
        if (this.Type === undefined){
            if (data.References !== undefined){
                this.References = [];
                for (var dataReference of data.References){
                    var referenceProperty = this.Parent.GetProperty(dataReference);
                    if (referenceProperty === undefined)
                        throw new Error(``);
                    this.References.push(referenceProperty);
                }

            }
        }
        else{
            if (data.Relationship !== undefined){
                this.Relationship = {};
                for (var name in data.Relationship){
                    var parentProperty = this.Parent.GetProperty(name);
                    if (parentProperty === undefined)
                        throw new Error(`Invalid Relactionship:Type(${this.Parent.Name}) does not have Property(${name})`);

                    var childProperty = this.Type.GetProperty(data.Relationship[name]);
                    if (childProperty === undefined)
                        throw new Error(`Invalid Relationship:Type(${this.Type.Name}) does not have Property(${data.Relationship[name]})`)

                    this.Relationship[name] = childProperty;
                }

                if (data.Type.match(/\[\]/)){
                    this.IsCollection = true;
                    this.Type = undefined;
                }
                else{
                    this.IsModel = true;
                }
                    
            }
        }


    }
    public Parent:Type;
    public Name:string;
    public Type?:Type;
    public IsModel:boolean = false;
    public IsCollection:boolean = false;
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