import { Model } from "./";

export enum PropertyType { 
    Column = "Column", Reference = "Reference" 
}
export class Property {
    constructor(model:Model, init:Partial<Property>){
        if (init.Name === undefined || init.Type === undefined)
            throw new Error(``);
        this.Model = model;
        this.Name = init.Name;
        this.Type = init.Type;
    }

    public Model:Model;
    public Name:string;
    public Type:PropertyType;
}
export class ColumnProperty extends Property {
    constructor(model:Model, init:Partial<ColumnProperty>){
        super(model, init);
        if (init.References !== undefined)
            this.References = init.References;
    }
    public References:string[] = [];
}
export class ReferenceProperty extends Property{
    constructor(model:Model, init:Partial<ReferenceProperty>){
        super(model, init);
        if (init.ReferenceType === undefined)
            throw new Error(`Invalid ReferenceProperty: ReferenceType is undefined.`)
        this.ReferenceType = init.ReferenceType;
        if (init.Columns != undefined)
            this.Columns  = init.Columns;
    }
    public ReferenceType:string;
    public Columns:string[] = [];
}