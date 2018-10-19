import { Attributes, Property, Properties } from "./";
import { Utilities } from "..";

export class Type {
    constructor(init:(()=>new(...args:any[])=>any)){
        this.__init=init;
    }
    public id:Utilities.Guid = Utilities.Guid.Create();
    private __init:(()=>new(...args:any[])=>any);
    public get Name():string{
        return this.Constructor.name;
    }
    public get Constructor():(new(...args:any[])=>any){
        return this.__init();
    }
    public Properties:Property[] = [];
    public GetProperties(arg?:Attributes|Partial<Attributes>|Type|(new (...args:any[])=>any)):Property[] {
        
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

        type = undefined;
        var attributes:Attributes | undefined;
        if (arg){
            switch (typeof(arg)){
                case "object":
                    if (arg instanceof Attributes)
                        attributes = arg;
                    else if (arg instanceof Type)
                        type = arg
                    else
                        attributes = new Attributes(<Partial<Attributes>>arg);
                    break;
                case "function":
                    type = Type.GetType(arg);
                    break;
            }

        }        
        if (attributes){
            result = result.filter(x => {
                if (! x.Attributes)
                    return false;
                if (attributes){
                    for (var key in attributes){
                        if ((<any>attributes)[key] != (<any>x.Attributes)[key])
                            return false;
                    }
                    return true;
                }
                return false;
            })
        }
        if (type){
            result = result.filter(x => {
                return (x.Type === type);
            });
        }
        return result;
    }
    public GetProperty(name:string|number|symbol):Property|undefined{
        if (typeof(name) !== "string")
            return undefined;

        switch (typeof(name)){
            case "number":
        }
        return this.GetProperties().find(x => {
            return x.Name === name;
        })
    }

    public get SuperType():Type|undefined{
        var types = Type.Types;
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

    public static Types:Type[] = [];
    // public static GetTypes():Type[] {
    //     var result:Type[] = (<any>window)["dataTypes"];
    //     if (! result){
    //         result = [];
    //         (<any>window)["dataTypes"] = result;
    //     }
    //     return result;
    // }
    public static GetType(type:(new (...args:any[])=>any)|object):Type|undefined {
        if (typeof(type)==="object")
            return Type.GetType(type.constructor);
        return Type.Types.find(x => {
            return x.Constructor === type;
        });
    }
}
// export class Types{
//     public Items:Type[] = [];

//     public filter(by:string|(new(...args:any[])=>any)):Type[] {
//         switch (typeof(by)){
//             case "string":
//                 return this.Items.filter((type:Type)=>{
//                     return type.Name === by;
//                 });
//             case "function":
//                 return this.Items.filter((type:Type)=>{
//                     return type.Constructor === by;
//                 });
//         }
//         return [];
//     } 
//     public find(by:new(...args:any[])=>any):Type|undefined{
//         return this.Items.find((type:Type)=>{
//             return type.Constructor === by;
//         });
//     }

//     public static Read():Types{
//         var result = (<any>window)["Types"];
//         if (result){
//             if (result instanceof Types)
//                 return result;
//             else
//                 throw new Error("window.Types in already in use");
//         }
//         else{
//             result = new Types();
//             (<any>window)["Types"] = result;
//         }
//         return result;
//     }
//     public static Select(by:string|(new(...args:any[])=>any)):Type[] {
//         var types = Types.Read();
//         return types.filter(by);
//     }
//     public static GetType(type:(new(...args:any[])=>any)|object):Type|undefined {
//         if (type && typeof(type) === "object")
//             return Types.GetType(type.constructor);
//         if (!type || type.name === "")
//             return undefined;

//         var types = Types.Read();
//         var result = types.find(type);
//         if (! result)
//             result = Types.Add(type);
//         return result;
//     }
//     public static Add(type:new(...args:any[])=>any):Type{
//         var types = Types.Read();
//         var result = types.find(type);
//         if (result)
//             return result;
//         result = new Type(()=>type);
//         types.Items.push(result);
//         return result;
//     }
// }