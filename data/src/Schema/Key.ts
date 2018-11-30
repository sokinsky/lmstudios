import { Type, Property } from "./";

export class Key {
    constructor(type:Type, init:{Name:string, Properties:string[]}) { 
        this.Type = type; 
        this.Name = init.Name;
        init.Properties.forEach(propertyName=>{
            var property = this.Type.GetProperty(propertyName);
            if (property === undefined)
                throw new Error(`Key.constructor():Type(${this.Type.Name}) does not have property(${propertyName})`)
            this.Properties.push(property);
        });
    }

    public Type:Type;
    public Name:string;
    public Properties:Property[] = []

    public static Create(type:Type, dataKeys:{Name:string,Properties:string[]}[]):Key[]{
        var results:Key[] = [];
        dataKeys.forEach((dataKey)=>{    
            results.push(new Key(type, dataKey));
        });
        return results;
    }
}