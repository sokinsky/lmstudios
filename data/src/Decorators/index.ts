import { Meta, Attributes } from "../";
import { Model, Context, Repository } from "../";
import { PropertyAttributes } from "../Meta/Property";

export function Controller(type:(()=>new(...args:any[])=>any)){
    return function(target:any){
        let classType = Meta.Type.GetType(target);
        let controllerType = Meta.Type.GetType(type);
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
export function Key(target:any, propertyName:string){
    var type = Meta.Type.GetType(target);
    var property = type.GetProperty(propertyName);
    if (property === undefined)
        throw new Error(`${propertyName}.${type.Name} has not been mapped(@Map)`);        
        property.Attributes.Key = true; 
}
export function Index(name:string){
    return function(target:any, propertyName:string){
        var type = Meta.Type.GetType(target);
        var property = type.GetProperty(propertyName);
        if (property === undefined)
            throw new Error(`${propertyName}.${type.Name} has not been mapped(@Map)`);        
        if (property.Attributes.Indexes.find(x => {return x === name}) === undefined)
            property.Attributes.Indexes.push(name);
    }
}
export function Required(target:any, propertyName:string){
    var type = Meta.Type.GetType(target);
    var property = type.GetProperty(propertyName);
    if (property === undefined)
        throw new Error(`Property(${propertyName}) has not been mapped to Type(${type.Name}).  Please add the @Map() decorator to ${type.Name} prior to the @Required decorator`); 
    property.Attributes.Required = true;    
}
export function Optional(target:any, propertyName:string){
    var type = Meta.Type.GetType(target);
    var property = type.GetProperty(propertyName);
    if (property === undefined)
        throw new Error(``)
    property.Attributes.Optional = true;
}
export function Match(pattern:string){
    return function(target:any, propertyName:string){
        var type = Meta.Type.GetType(target);
        var property = type.GetProperty(propertyName);
        if (property === undefined)
            throw new Error(`Property(${propertyName}) has not been mapped to Type(${type.Name}).  Please add the @Map() decorator to ${type.Name} prior to the @Match decorator`); 

        if (property.Type.Name !== "String")
            throw new Error(`Property(${property.Name}) an not have @Match applied because it is not mapped(@Map) to a String`);
        property.Attributes.Match = pattern;
    }
}
