import { Model } from "./Model";

export class Context {
    constructor(init?:Partial<Context>){
        if (init !== undefined){
            console.log(init);
            if (init.Models !== undefined){
                init.Models.forEach(model=>{
                    this.Models.push(new Model(this, model));
                });           
            }
        }

    }
    public Models:Model[] = [];
}