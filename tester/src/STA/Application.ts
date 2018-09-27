import { Assembly } from "@lmstudios/reflection";
import { Context } from "./Data/Context";
import * as LMS from "@lmstudios/entity";
import { STATUS_CODES } from "http";

export class Application extends LMS.Application {
    public async buildAssemblies(){
        //this.Assemblies.push(await Assembly.Open("Entity", import("@lmstudios/entity")));
        this.Assemblies.push(await Assembly.Open("STA", import("./")));
    }
     public async buildContext(){
        this.Context = new Context(this, this.GetAssembly("STA"));
    } 
}