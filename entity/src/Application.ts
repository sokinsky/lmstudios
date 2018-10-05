import { Type, TypeCollection } from "@lmstudios/reflection";
import { Context } from "./";

export class Application{
    constructor(){
        this.Context = new Context(this, "");
        (<any>window)["Application"] = this;        
     }
    public Context:Context;
}