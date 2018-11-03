import { Type } from "./";
import { Attributes } from "../";

export class Property {
    constructor(name:string, type:Type){
        this.Name = name;
        this.Type = type;
    }
    public Name:string;
    public Type: Type;
    public Attributes:PropertyAttributes = new PropertyAttributes();

    public GetValue(item:any):any{
        return item[this.Name];
    }
    public SetValue(item:any, value:any){
        item[this.Name] = value;
    }
}
export class PropertyAttributes {
    public Key:boolean = false;
    public Required:boolean = false;
    public Principal:boolean = false;
    public Match?:Attributes.Match;
    public Indexes:Attributes.Index[] = [];
}