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

    public CircularReferences(property?:Property):Property[]|undefined{
        if (this.PrimaryKey.Properties[0].References === undefined || this.PrimaryKey.Properties[0].References.length === 0)
            return undefined;
        var result = this.PrimaryKey.Properties[0].References;
        if (property !== undefined)
            result = result.filter(x => {return x === property});
        if (result.length === 0)
            return undefined;
        return result;
    }
    public LocalReferences(property?:Property):Property[]|undefined{
        var result = this.Properties.filter(x => { 
            return (x.References !== undefined && x.References.find(y => { 
                return y.Type !== undefined && y.Type === this 
            }));
        });
        if (property !== undefined)
            result = result.filter(x => { return x.References != undefined && x.References.find(y => {return y === property}) !== undefined })
        if (result.length == 0)
            return undefined;
        return result;
    }

    public Constructor?:(new (...args: any[]) => any)

    public GetProperty(name:string):Property|undefined{
        return this.Properties.find(x => {
            return x.Name == name;
        });        
    }
}
