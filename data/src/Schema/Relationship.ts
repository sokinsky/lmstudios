import { Type, Reference, Property } from ".";

export class Relationship {
    constructor(parent:Reference, data:{Type:string, Properties:any}) { 
        this.Parent = parent;
        if (this.Parent.Parent.Type === undefined)
            throw new Error(``);
        var type = this.Parent.Parent.Type.Context.GetType(data.Type);
        if (type === undefined)
            throw new Error(``);
        this.Type = type;
        this.Properties = {};
        for (var propertyName in data.Properties){
            var childProperty = this.Type.GetProperty(data.Properties[propertyName]);
            if (childProperty === undefined)
                throw new Error(``);
            this.Properties[propertyName] = childProperty;
        }
    }

    public Parent:Reference;
    public Type:Type;
    public Properties:{[name:string]:Property} = {};
}