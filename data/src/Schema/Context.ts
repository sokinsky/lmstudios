import { Type } from "./Type";

export class Context {
    constructor(init?:Partial<Context>){
        if (init !== undefined){
            if (init.Types !== undefined){
                init.Types.forEach(type=>{
                    this.Types.push(new Type(this, type));
                });           
            }
        }
    }
    public Types:Type[] = [];
}