import { Context, Property, Key } from "./";

export class Type {
    constructor(context:Context, name:string){
        this.Context = context;
        this.Name = name;
    }
    public Initialize(data:{Name:string, Keys:{ Name:string, Properties:string[] }[], Properties:{ Name:string, Type:string, Relationship?:{[name:string]:string}, Reference?:string }[]} ){
        for (let property of this.Properties){
            let propertyData = data.Properties.find(x => { return (x.Name === property.Name); });
            if (propertyData !== undefined)
                property.Initialize(propertyData);
        }
        for (let keyData of data.Keys){
            let key = this.Keys.find((x:any) => {return x.Name == keyData.Name});
            if (key === undefined){
                key = new Key(this, keyData);
                this.Keys.push(key);
            }                
        }
    }
    

    public Context:Context;
    public Name:string = "";
    public Properties:Property[] = [];
    public Keys:Key[] = [];
    public get PrimaryKey():Key{
        if (this.Keys.length == 0)
            throw new Error(`Type(${this.Name}) does not have a PrimaryKey`);
        return this.Keys[0];
    }
    public get AdditionalKeys():Key[]{
        var result:Key[] = [];
        this.Keys.forEach(key=>{
            if (key !== this.PrimaryKey)
                result.push(key);
        });
        return result;
    }

    public Constructor?:(new (...args: any[]) => any)

    public GetProperty(name:string):Property|undefined{
        return this.Properties.find(x => {
            return x.Name == name;
        });        
    }
}

