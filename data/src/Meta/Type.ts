import { Property } from "./";
import { Attributes, Utilities } from "..";

export class Type {
    constructor(init:(()=>new(...args:any[])=>any)){
        this.__init=init;
    }
    public id:Utilities.Guid = Utilities.Guid.Create();
    private __init:(()=>new(...args:any[])=>any);
    public Attributes:TypeAttributes = new TypeAttributes(this);

    public get Name():string{
        return this.Constructor.name;
    }
    public get Constructor():(new(...args:any[])=>any){
        return this.__init();
    }
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
    public get SuperType():Type|undefined{
        var types = Type.GetTypes();
        var constructor = Object.getPrototypeOf(this.Constructor);
        return types.find(x=>{
            return (x.Constructor === constructor);
        });
    }
    public IsSubTypeOf(type:new (...args:any[])=>any){
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
    public get Indexes():{[name:string]:{Index:Attributes.Index,Property:Property}[]} {  
        var result:{[name:string]:{Index:Attributes.Index,Property:Property}[]} = {};
        this.Type.GetProperties().forEach(property=>{
            property.Attributes.Indexes.forEach(index=>{
                if (result[index.Name] === undefined)
                    result[index.Name] = [];
                var check = result[index.Name].find(x => { return x.Index === index; });
                if (check === undefined)
                    result[index.Name].push({Index:index, Property:property});                
            });
        })      
        return result;
    }
    public get PrimaryKey():Property|undefined {
        return this.Type.GetProperties().find(x => { return x.Attributes.Key; });
    }
}