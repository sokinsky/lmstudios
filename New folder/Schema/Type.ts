import { Context, Property, Key } from "./";

export class Type {
    constructor(context:Context, init:any){
        this.__init = init;
        this.FullName = init.Name;
        this.Context = context;
    }
    private __init:any;
    public Context:Context;
    public FullName:string;
    public Constructor?:(new (...args: any[]) => any)

    public get Name():string{
        var split = this.FullName.split('.');
        return split[split.length-1];
    };
    public get Namespace():string{
        var split = this.FullName.split('.');
        split = split.splice(split.length-1);
        var result = "";
        split.forEach(part =>{
            result += `${part}.`
        });
        return result.replace(/\.$/, "");
    }; 
    public Properties:Property[] = [];

    public GetProperty(name:string):Property|undefined{
        return this.Properties.find(x => {
            return x.Name == name;
        });        
    }
}

