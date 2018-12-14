import { Type, Property, Model } from "./";

export class Key {
    constructor(model:Model, init:{Name:string, Properties:string[]}) { 
        this.Model = model; 
        this.Name = init.Name;
        init.Properties.forEach(propertyName=>{
            var property = this.Model.GetProperty(propertyName);
            if (property === undefined)
                throw new Error(`Key.constructor():Type(${this.Model.FullName}) does not have property(${propertyName})`)
            this.Properties.push(property);
        });
    }

    public Model:Model;
    public Name:string;
    public Properties:Property[] = []
}