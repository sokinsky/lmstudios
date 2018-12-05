import { Type, Key, Property, Constraint } from "./";

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
                console.log(type);   
                var typeData = contextData.Types.find((tdata:any)=>{ return(tdata.Name === type.Name); });
                console.log(typeData);
                if (typeData !== undefined){
                    type.Properties.forEach(property =>{
                        console.log(property);
                        var propertyData = typeData.Properties.find((propertyData:any)=>{ return (propertyData.Name === property.Name) });
                        console.log(propertyData);
                        if (propertyData !== undefined){
                            property.PropertyType = this.GetType(propertyData.PropertyType);
                            if (propertyData.Constraints !== undefined)
                                property.Constraints = Constraint.Create(property, propertyData.Constraints);
                            //if (propertyData.References !== undefined)
                                // property.References = Reference.Create(property, propertyData.References);
                        }
                    });                    
                    type.Keys = Key.Create(type, typeData.Keys);
                }
            })
        }
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
