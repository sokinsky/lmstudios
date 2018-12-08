import { Type, Property } from ".";

export class Relationship {
    constructor(parent:Property, data:{Type:string, Properties:any}) { 
        this.Parent = parent;   
        this.Type = parent.Parent.Context.GetType(data.Type);     
        for (var name in data.Properties){
            this.Properties[name] = parent.Parent.GetProperty()
        }
    }

    public Parent:Property;
    public Type?:Type;
    public Properties:{[name:string]:Property} = {};
}