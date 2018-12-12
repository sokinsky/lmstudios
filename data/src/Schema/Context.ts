import { Type, Key, Property } from "./";

export class Context {
    constructor(contextData?:any){
        if (contextData !== undefined){
            if (contextData.Name !== undefined) 
                this.Name = contextData.Name;
            if (contextData.Types !== undefined){
                for (var typeData of contextData.Types){
                    var type = new Type(this, typeData.Name);
                    if (typeData.Properties !== undefined){
                        for (var propertyData of typeData.Properties){
                            type.Properties.push(new Property(type, propertyData.Name));
                        }
                    }
                    this.Types.push(type);
                }      
            }
            for (let type of this.Types){
                var typeData = contextData.Types.find((x:any) => { return x.Name === type.Name; } );
                type.Initialize(typeData);
            }
        }
    }

    public Name:string = "";
    public Types:Type[] = [];

    public GetType(name:string|(new (...args: any[]) => any)):Type|undefined {
        if (typeof(name) === "string"){
            if (name.match(/\[\]$/))
                name = name.replace(/\[\]$/, "");
            return this.Types.find(type => {
                return (type.Name == name)
            }); 
        }
        else{
            return this.Types.find(type => {
                return (type.Constructor === name);
            })
        }
        return undefined;
    }
}
