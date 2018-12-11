import { Type } from "./";

export class Property {
    constructor(parent:Type, name:string){
        this.Parent = parent;  
        this.Name = name;
    }
    public Initialize(data:{ Name:string, Type:string, Relationship?:{ [name:string]:string }, Reference?:string }){
        
        this.Type = this.Parent.Context.GetType(data.Type);
        if (this.Type === undefined){
            if (data.Reference !== undefined){
                this.Reference = this.Parent.GetProperty(data.Reference);
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
            }
        }

        if (data.Type.match(/\[\]/))
            this.Type = undefined;
    }
    public Parent:Type;
    public Name:string;
    public Type?:Type;
    public Relationship?:{[name:string]:Property};
    public Reference?:Property;
    
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