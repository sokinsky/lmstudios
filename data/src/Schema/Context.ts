import * as LMS from "../";

//LMS.Schema.Context
export class Context {
    constructor(contextData?:any){
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
            for (let model of this.Models){
                var modelData = contextData.Models.find((x:any) => { return x.FullName === model.FullName; } );
                model.Initialize(modelData.Keys, modelData.Properties);
            }
        }
    }
    public Name:string = "";
    public Models:LMS.Schema.Model[] = [];

    public GetModel(value:string|(new (...args:any[])=>LMS.Model)):LMS.Schema.Model{
        switch (typeof(value)){
            case "string":
                return this.getModel_byName(<string>value);
            default:
                throw new Error(`Context.GetModel():Invalid Parameter`);
        }
    }
    public getModel_byName(name:string):LMS.Schema.Model{
        var results = this.Models.filter(model => { return model.FullName == name });
        switch (results.length){
            case 0: throw new Error(`Context.getModel_byName():Model(${name}) could not be found.`);
            case 1: return results[0];
            default: throw new Error(`Context.GetModel_byName():Model(${name}) was ambiguous`);
        }
    }
}
