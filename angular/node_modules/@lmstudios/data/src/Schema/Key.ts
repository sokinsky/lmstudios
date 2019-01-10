import { Type, Property, Model } from "./";

export class Key {
    constructor(model:Model, init:any) { 
        this.Model = model; 
        if (init.Name === undefined)
            throw new Error(`Key.constructor():Name is required`);
        this.Name = init.Name;
        if (init.Properties === undefined)
            throw new Error(`Key.constructor():Properties are required`);
        
        init.Properties.forEach((data:{Model:string, Name:string})=>{
            var model = this.Model.Context.GetModel(data.Model);
            if (model !== this.Model)
                throw new Error(`Key.constructor():Key properties can not be foreign`);
                
            var property = model.GetProperty(data.Name);
            if (property === undefined)
                throw new Error(`Property(${data.Name}) does not exist on Model(${data.Model})`);
            this.Properties.push(property);
        });
    }

    public Model:Model;
    public Name:string;
    public Properties:Property[] = []
}