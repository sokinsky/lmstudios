import { Type, Property } from "./";

export class Model {
    constructor(property:Property, init:{ModelType:string, Properties:any}) { 
        var modelType = property.Type.Context.GetType(init.ModelType); 
        if (modelType === undefined)
            throw new Error(``);
        this.ModelType = modelType;
        this.Properties = init.Properties;
    }

    public ModelType:Type;
    public Properties:any;
}