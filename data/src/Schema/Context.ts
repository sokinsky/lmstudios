import { Type, Key, Property, Reference } from "./";

export class Context {
    constructor(contextData?:any){
        if (contextData !== undefined){
            if (contextData.Name !== undefined) this.Name = contextData.Name;
            if (contextData.Types !== undefined){
                contextData.Types.forEach((typeData:any)=>{
                     var type = new Type(this, typeData);                    
                    if (typeData.Properties !== undefined){
                        typeData.Properties.forEach((propertyData:any)=>{
                            type.Properties.push(new Property(type, propertyData));
                        });                        
                    }
                    this.Types.push(type);
                });       
            }
            this.Types.forEach(type => {           
                var typeData = contextData.Types.find((tdata:any)=>{ return(tdata.Name === type.Name); });
                if (typeData !== undefined){
                    type.Properties.forEach(property =>{
                        var propertyData = typeData.Properties.find((propertyData:any)=>{ return (propertyData.Name === property.Name) });
                        if (propertyData !== undefined){
                            property.Type = this.GetType(propertyData.PropertyType);
                            if (propertyData.References !== undefined){
                                for (var referenceData of propertyData.References){
                                    property.References.push(new Reference(property, referenceData));
                                }
                            }

                        }
                    });                    
                    type.Keys = Key.Create(type, typeData.Keys);
                }
            })
        }
        console.log(this);
    }

    public Name:string = "";
    public APIUrl:string = "";
    public Types:Type[] = [];

    public GetType(name:string|(new (...args: any[]) => any)):Type|undefined {
        if (typeof(name) === "string"){
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
