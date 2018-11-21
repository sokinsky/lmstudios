import { Context, Property, Key } from ".";

export class Type {
    constructor(context:Context, init:Partial<Type>){
        this.Context = context;
        if (init.Name !== undefined)
            this.Name = init.Name;
        if (init.Keys !== undefined){
            init.Keys.forEach(key =>{
                this.Keys.push(key);
            });
        }
        if (init.Properties !== undefined){
            init.Properties.forEach(property =>{
                this.Properties.push(property);
            })
        }
    }
    public Context:Context;
    public Name:string = "";
    public Keys:Key[] = [];
    public Properties:Property[] = [];
}
