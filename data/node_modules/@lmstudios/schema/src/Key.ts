import { Type } from "@lmstudios/types";
import { Model } from "./Model";
import { Property } from "./Property";

export class Key {
    constructor(model:Model, init:any) { 
        this.Model = model; 
        this.Name = init.Name;
        for (var propertyData of init.Properties){

        }
        init.Properties.forEach((data:{Model:string, Name:string})=>{
            var model = this.Model.Context.Models.find(x => { return x.Type.UID === data.Model } );
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