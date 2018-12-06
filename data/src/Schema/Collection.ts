import { Type, Property } from "./";

export class Collection {
    constructor(property:Property, init:{CollectionType:string, Properties:any}) { 
        var collectionType = property.Type.Context.GetType(init.CollectionType);
        if (collectionType === undefined)
            throw new Error(``);
        this.CollectionType = collectionType;
        this.Properties = init.Properties;
    }

    public CollectionType:Type;
    public Properties:any;
}