import { Type, Property } from "./";

export class Key {
    constructor(type:Type, init:any){
        this.__init = init;
        this.Type = type;
    }
    private __init:any;
    public Type:Type;
    public get Name():string{
        return this.__init.Name;
    };
    public get Properties():Property[] {
        var results:Property[] = [];
        this.__init.Properties.forEach((propertyName:string)=>{
            console.log(propertyName);
            results.push(this.Type.GetProperty(propertyName));
        });
        return results;
    };
}