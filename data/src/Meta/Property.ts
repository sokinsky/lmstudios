import { Type } from "./";
import { Attributes } from "../";

export class Property {
    constructor(name:string, type:Type|(()=>new(...args:any[])=>any)){
        this.Name = name;
        this.__type = type;
    }
    public Name:string;
    private __type:Type|(()=>new(...args:any[])=>any);
    public get Type(): Type{
        if (this.__type instanceof Type)
            return this.__type;
        return Type.GetType(this.__type());
    }
    public Attributes:PropertyAttributes = new PropertyAttributes();

    public GetValue(item:any):any{
        return item[this.Name];
    }
    public SetValue(item:any, value:any){
        item[this.Name] = value;
    }
}
export class PropertyAttributes {
    constructor(init?:Partial<PropertyAttributes>){
        if (init !== undefined){
            for (var name in init){
                if ((<any>init)[name] !== undefined)
                    (<any>this)[name] = (<any>init)[name];    
            }
        }
    }
    public Key?:boolean;
    public Indexes:string[] = [];

    public Required:boolean = false;
    public Optional:boolean = false;
    public Match?:string;
}