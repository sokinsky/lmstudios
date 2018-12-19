import * as LMS from "../";

export class Model extends LMS.Type {
    constructor(context:LMS.Schema.Context, name:string, constructor?:(new (...args: any[]) => any)){
        super(name, constructor);
        this.Context = context;
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
                key = new LMS.Schema.Key(this, keyData);
                this.Keys.push(key);
            }                
        }
    }
    public Context:LMS.Schema.Context;       
    public Properties:LMS.Schema.Property[] = [];
    public GetProperty(name:string):LMS.Schema.Property|undefined{
        return this.Properties.find(x => {
            return x.Name == name;
        });        
    }
    public Keys:LMS.Schema.Key[] = [];
    public get PrimaryKey():LMS.Schema.Key{
        if (this.Keys.length == 0)
            throw new Error(`Type(${this.Name}) does not have a PrimaryKey`);
        var key = this.Keys[0];
        if (key.Properties.length != 1)
            throw new Error(`Type(${this.Name}) does not have a PrimaryKey`);
        return key;
    }
    public get AdditionalKeys():LMS.Schema.Key[]{
        var result:LMS.Schema.Key[] = [];
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
