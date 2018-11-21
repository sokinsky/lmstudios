import { Property } from "./";
import { Attributes, Utilities, Schema } from "..";

export class Type {
    constructor(init:(()=>new(...args:any[])=>any)){
        this.__init=init;
    }
    private __id:Utilities.Guid = Utilities.Guid.Create();
    private __init:(()=>new(...args:any[])=>any);
    public Schema?:Schema.Type;

    public get Name():string{
        return this.Constructor.name;
    }
    public get Constructor():(new(...args:any[])=>any){
        return this.__init();
    }
    public Controller?:Type;
    public Properties:Property[] = [];
    public GetProperties():Property[] {        
        var result:Property[] = [];
        var type:Type|undefined = this;
        var chain:Type[] = [];

        while (type){
           chain.push(type);
           type = type.SuperType;
        }
        chain = chain.reverse();
        chain.forEach((item:Type)=>{
            item.Properties.forEach(element => {
                result.push(element);
            });
        });
        return result;
    }
    public GetProperty(name:string|number|symbol):Property|undefined{
        if (typeof(name) !== "string")
            return undefined;
        return this.GetProperties().find(x => {
            return x.Name === name;
        })
    }
    public get Key():Property|undefined{
        var results = this.GetProperties().filter(x => {
            return x.Attributes.Key;
        })
        switch (results.length){
            case 0:
                return undefined;
            case 1:
                return results[0];
            default:
                throw new Error(``);
        }
    }
    public get Indexes():{[name:string]:Property[]}{
        var results:{[name:string]:Property[]} = {};
        this.GetProperties().forEach(property=>{
            property.Attributes.Indexes.forEach(index=>{
                if (results[index] === undefined)
                    results[index] = [];
                if (results[index].find(p => { return p.Name === property.Name}) === undefined)
                    results[index].push(property);
            })
        })
        return results;
    }

    public get SuperType():Type|undefined{
        var types = Type.GetTypes();
        var constructor = Object.getPrototypeOf(this.Constructor);
        return types.find(x=>{
            return (x.Constructor === constructor);
        });
    }
    public IsSubTypeOf(type:new (...args:any[])=>any):boolean{
        var check:any = this.Constructor;
        while (check){
            if (check === type)
                return true;
            check = Reflect.getPrototypeOf(check);
        }
        return false;
    }

    

    public static GetType(type:(new (...args:any[])=>any)|object):Type {       
        if (typeof(type)==="object")
            return Type.GetType(type.constructor);

        var types = Type.GetTypes();
        var result = types.find(x => {
            return x.Constructor === type;
        });
        if (result === undefined){
            result = new Type(()=>type);
            types.push(result);
        }
        return result;
    }
    public static GetTypes() : Type[] {
        var result = (<any>window)["metaTypes"];
        if (result === undefined){
            result = [];
            (<any>window)["metaTypes"] = result;
        }
        return result;
            
    }
}
export class TypeAttributes {
    constructor(type:Type){
        this.Type = type;
    }
    public Type:Type;
    public Controller?:Attributes.Controller;
}