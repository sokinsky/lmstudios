import { Assembly, Type } from "@lmstudios/reflection";
import { Context } from "./";

export class Application{
    public Assemblies:Assembly[] = [];
    public Context?:Context;


    public GetAssembly(name:string):Assembly{
        let result = this.Assemblies.find(x=>{
            return x.Name == name;
        })
        if (!result)
            throw new Error(`Unable to find Assembly(${name})`);
        return result;
    }
    public GetType(type:object|string):Type|undefined{
        let result:Type|undefined = undefined;
        this.Assemblies.forEach((assembly:Assembly)=>{
            result = assembly.GetType(type);
            if (result)
                return result;
        });
        return result;
    }

    public async buildAssemblies(){

    }
    public async buildContext(){

    }   

    public async Start(init:(...args:any[])=>void){
        await this.buildAssemblies();
        await this.buildContext();

        if (! (<any>window)["Application"])
            (<any>window)["Application"] = this;
        init();
    } 
    public static Retrieve():Application{
        return (<any>window)["Application"];
    }
}