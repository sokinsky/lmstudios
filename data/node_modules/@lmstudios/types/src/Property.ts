import { Type } from './Type';

export class Property {
    constructor(name:string, type:Type){
        this.Name = name;
        this.PropertyType = type;
    }
    public Name:string;
    public PropertyType:Type;

    public GetValue(item:any){
        return item[this.Name];
    }
    public SetValue(item:any, value:any){
        item[this.Name] = value;
    }
}