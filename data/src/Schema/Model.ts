import * as LMS from "../";
import { Context, Property, Key, Type } from "./";

export class Model extends LMS.Type {
    constructor(context:Context, name:string){
        super(name);

        this.Context = context;
        this.FullName = name;
        this.Name = "";
        this.Namespace = "";
        var split = name.split('.');
        for (var i=0; i<split.length; i++){
            if (i === split.length-1)
                this.Name = split[i];
            else
                this.Namespace += `${split[i]}.`
        }
        this.Namespace = this.Namespace.replace(/\.$/, "");
    }
    public Initialize(keys: { Name:string, Properties: string[] }[], properties:{ Name:string, PropertyType:string, Relationship?:{[name:string]:string}, References?:string }[] ){
        for (let property of this.Properties){
            let propertyData = properties.find(x => { return (x.Name === property.Name); });
            if (propertyData !== undefined)
                property.Initialize(propertyData);
        }
        for (let keyData of keys){
            let key = this.Keys.find((x:any) => {return x.Name == keyData.Name});
            if (key === undefined){
                key = new Key(this, keyData);
                this.Keys.push(key);
            }                
        }
    }
    public Context:Context;       
    public Name:string;
    public Namespace:string;
    public FullName:string;
    public Properties:Property[] = [];
    public GetProperty(name:string):Property|undefined{
        return this.Properties.find(x => {
            return x.Name == name;
        });        
    }
    public Keys:Key[] = [];
    public get PrimaryKey():Key{
        if (this.Keys.length == 0)
            throw new Error(`Type(${this.Name}) does not have a PrimaryKey`);
        var key = this.Keys[0];
        if (key.Properties.length != 1)
            throw new Error(`Type(${this.Name}) does not have a PrimaryKey`);
        return key;
    }
    public get AdditionalKeys():Key[]{
        var result:Key[] = [];
        this.Keys.forEach(key=>{
            if (key !== this.PrimaryKey)
                result.push(key);
        });
        return result;
    }

    public GetConstructor():(new (...args: any[]) => any) {
        var type = LMS.Type.GetType(this.FullName);
        if (type === undefined || type.Constructor === undefined)
            throw new Error(``);
        return type.Constructor;
    }
}
