import { Type, Reference } from "./";

export class Property {
    constructor(parent:Type, data:{Name:string, Type:string, References:any[]}){
        this.Parent = parent;  
        this.Name = data.Name;
        this.Type = this.Parent.Context.GetType(data.Type);
        this.References = [];


    }
    public Parent:Type;
    public Name:string;
    public Type?:Type;
    public References:Reference[];
    
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