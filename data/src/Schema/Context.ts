import * as LMS from "../";

//LMS.Schema.Context
export class Context {
    constructor(contextData?:any){
        console.log(contextData);
        if (contextData !== undefined){
            if (contextData.FullName !== undefined) 
                this.Name = contextData.FullName;

            if (contextData.Models !== undefined){
                for (var modelData of contextData.Models){
                    var model = new LMS.Schema.Model(this, modelData.FullName);
                    if (modelData.Properties !== undefined){
                        for (var propertyData of modelData.Properties){
                            model.Properties.push(new LMS.Schema.Property(model, propertyData.Name));
                        }
                    }
                    this.Models.push(model);
                }      
            }
            console.log(this);
            for (let model of this.Models){
                var modelData = contextData.Models.find((x:any) => { return x.FullName === model.FullName; } );
                model.Initialize(modelData.Keys, modelData.Properties);
            }
        }
    }
    public Name:string = "";
    public Models:LMS.Schema.Model[] = [];
}
