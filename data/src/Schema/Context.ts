import * as LMS from "../";

//LMS.Schema.Context
export class Context {
    constructor(contextData?:any){
          if (contextData !== undefined){
            if (contextData.FullName !== undefined) 
                this.Name = contextData.FullName;

            if (contextData.Models !== undefined){
                for (var modelData of contextData.Models){
                    
                    var type = LMS.Type.GetTypes().find(x => { return x.FullName === modelData.FullName});                    
                    if (type !== undefined && ! (type instanceof LMS.Schema.Model)){                    
                        var index = LMS.Type.GetTypes().indexOf(type);
                        LMS.Type.GetTypes()[index] = new LMS.Schema.Model(this, modelData.FullName, type.Constructor);
                    }
                    var model = LMS.Type.GetTypes().find(x => { return x.FullName === modelData.FullName});
                    if (! (model instanceof LMS.Schema.Model))
                        throw new Error(``);
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
            case "function":
                return this.getModel_byConstructor(<(new (...args:any[])=>any)>value);
            default:
                console.log(value);
                throw new Error(`Context.GetModel():Invalid Parameter`);
        }
    }
    public getModel_byConstructor(constructor:(new (...args:any[])=>any)){
        var results = this.Models.filter(model => { return model.Constructor == constructor });
        switch (results.length){
            case 0:
                console.log(constructor);
                console.log(this.Models); 
                throw new Error(`Context.getModel_byConstructor():Model(${constructor}) could not be found.`);
            case 1: return results[0];
            default: throw new Error(`Context.getModel_byConstructor():Model(${constructor}) was ambiguous`);
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
