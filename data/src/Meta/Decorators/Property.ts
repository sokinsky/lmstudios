import * as Meta from "../";

export function Property(typeConstructor:(()=>new(...args:any[])=>any), typeAttributes?:Meta.Attributes|Partial<Meta.Attributes>) {
    let type:(()=>new(...args:any[])=>any) = typeConstructor;
    let attributes:Meta.Attributes|undefined;
    if (typeAttributes !== undefined){
        if (typeAttributes instanceof Meta.Attributes)
            attributes = typeAttributes;
        else
            attributes = new Meta.Attributes(typeAttributes);        
    }
    return function(target:any, propertyName:string){
        var types:Meta.Type[] = Meta.Type.Types;

        let classType:Meta.Type|undefined = types.find(x =>{
            return x.Constructor === target.constructor
        });
        if (! classType){
            classType = new Meta.Type(() => target.constructor);
              types.push(classType);
        }
        let propertyType:Meta.Type|undefined = types.find(x =>{
            return x.Constructor === type()
        });
        if (propertyType === undefined){
            propertyType = new Meta.Type(type);
            types.push(propertyType);
        }          
        let property:Meta.Property = new Meta.Property(propertyName, propertyType);     
        if (attributes)
            property.Attributes = attributes;
        classType.Properties.push(property);
     }      
}