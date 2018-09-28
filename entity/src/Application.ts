import { Assembly, Type, TypeCollection } from "@lmstudios/reflection";
import { Context } from "./";

export class Application{
    constructor(){
        (<any>window)["Application"] = this;
    }
    public Context?:Context;
    public get Types():TypeCollection{
        var result = <TypeCollection>(<any>window).Types;
        if (! result){
            result = new TypeCollection();
            (<any>window).Types = result;
        }
        return result;           
    }

    public GetType(type:(new(...args:any[])=>any)|object|string):Type|undefined{
        if (typeof(type) === "object")
            return this.GetType(type.constructor);
        switch (typeof(type)){
            case "string":
                var collection = <TypeCollection>(<any>window).Types;
                return collection.Select(<string>type);
            case "function":
                return TypeCollection.GetType(<new(...args:any[])=>any>type);
        }
        return undefined;
    }
}