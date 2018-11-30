import { Context, Property, Key } from "./";

export class Type {
    constructor(context:Context, typeData:string|{Name:string, Properties:{Name:string, PropertyType:string}[]}){
        this.Context = context;
        if (typeof(typeData) === "string")
            this.Name = typeData;
        else
            this.Name = typeData.Name;
    }
    public Context:Context;
    public Name:string = "";
    public Properties:Property[] = [];
    public Keys:Key[] = [];
    public Constructor?:(new (...args: any[]) => any)

    public GetProperty(name:string):Property|undefined{
        return this.Properties.find(x => {
            return x.Name == name;
        });        
    }
}

