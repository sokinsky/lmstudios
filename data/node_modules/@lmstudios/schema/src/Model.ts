import { Type } from "@lmstudios/types";
import { Context } from "./Context";
import { Key } from "./Key";
import { Property } from "./Property";

export class Model  {
    constructor(context:Context, type:Type){
        this.Context = context;
        this.Type = type;
    }
    public Context:Context;
    public Type:Type;
    public Properties:Property[] = [];
    public GetProperty(name:string):Property|undefined{
        return this.Properties.find(x => {
            return x.Name == name;
        });        
    }
    public Keys:Key[] = [];
    public get PrimaryKey():Key{
        if (this.Keys.length == 0)
            throw new Error(`Type(${this.Type.FullName}) does not have a PrimaryKey`);
        var key = this.Keys[0];
        if (key.Properties.length != 1)
            throw new Error(`Type(${this.Type.FullName}) does not have a PrimaryKey`);
        return key;
    }
    public get PrimaryKeyProperty():Property{
        return this.PrimaryKey.Properties[0];
    }
    public get AdditionalKeys():Key[]{
        var result:Key[] = [];
        this.Keys.forEach(key=>{
            if (key !== this.PrimaryKey)
                result.push(key);
        });
        return result;
    }
}
