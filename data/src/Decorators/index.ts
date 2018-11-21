import { Meta, Attributes } from "../";
import { PropertyAttributes } from "../Meta/Property";


export { Controller } from "./Controller";(controllerType?:(()=>new(...args:any[])=>any)){
    var controllerType:(()=>new(...args:any[])=>any)|undefined = controllerType;     
    return function(target:any){
        var type = Meta.Type.GetType(target);
        if (controllerType !== undefined)
            type.Controller = Meta.Type.GetType(controllerType);
     }    
}
export function Map(typeConstructor:(()=>new(...args:any[])=>any), attributes?:Partial<PropertyAttributes>) {
    let type:(()=>new(...args:any[])=>any) = typeConstructor;
    return function(target:any, propertyName:string){
        let classType = Meta.Type.GetType(target); 
        let property = classType.GetProperty(propertyName);
        if (property === undefined){
            property = new Meta.Property(propertyName, type);
            classType.Properties.push(property);
        }            
        if (attributes !== undefined)
            property.Attributes = new PropertyAttributes(attributes);
     }      
}
