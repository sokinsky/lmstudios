import * as Meta from "../";
import { Type, PropertyInfo } from "@lmstudios/reflection";

export function Property(arg1?:(()=>new(...args:any[])=>any)|Meta.Attributes|Partial<Meta.Attributes>, arg2?:Meta.Attributes|Partial<Meta.Attributes>) {
    let type:(()=>new(...args:any[])=>any);
    let attributes:Meta.Attributes|undefined;

    if (arg1){
        if (typeof(arg1) === "function")
            type = arg1;
        else if (!(arg1 instanceof Meta.Attributes))
            attributes = new Meta.Attributes(arg1);
        else
            attributes = arg1;
    }
    if (arg2){
        if (! (arg2 instanceof Meta.Attributes))
            attributes = new Meta.Attributes(arg2);
        else
            attributes = arg2;
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
        let propertyType:Meta.Type|undefined = undefined;
        if (type){
            if (type()){
                propertyType = types.find(x =>{
                    return x.Constructor === type()
                });
            }
            if (propertyType === undefined){
                propertyType = new Meta.Type(type);
                types.push(propertyType);
            }

        }    
        
        let property:Meta.Property = new Meta.Property(propertyName);
        if (propertyType)
            property.Type = propertyType;       
        if (attributes)
            property.Attributes = attributes;
        classType.Properties.push(property);
     }      
}