import { Model, Key } from "./";

export class Property {
    constructor(model:Model, init:Partial<Property>){
        this.Model = model;
        if (init.Name !== undefined)
            this.Name = init.Name;
        if (init.Type != undefined)
            this.Type = init.Type;
        if (init.Required !== undefined)
            this.Required = init.Required;
        if (init.Key != undefined)
            this.Key = new Key(init.Key);
    }

    public Model:Model;
    public Name:string = "";
    public Type:string = "";
    public Required:boolean = false;
    public Key?:Key;
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