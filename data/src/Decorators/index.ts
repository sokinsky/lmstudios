import { Meta, Attributes } from "../";
import { Model } from "../";

export function Map(typeConstructor:(()=>new(...args:any[])=>any)) {
    let type:(()=>new(...args:any[])=>any) = typeConstructor;
    return function(target:any, propertyName:string){
        let classType = Meta.Type.GetType(target);
        let propertyType = Meta.Type.GetType(type());
        let property = classType.GetProperty(propertyName);
        if (property === undefined){
            classType.Properties.push(new Meta.Property(propertyName, propertyType));
        }
     }      
}
export function Key(target:any, propertyName:string){
    var type = Meta.Type.GetType(target);
    var property = type.GetProperty(propertyName);
    if (property === undefined)
        throw new Error(`Property(${propertyName}) has not been mapped to Type(${type.Name}).  Please add the @Map() decorator to ${type.Name} prior to the @Key decorator`);        
    property.Attributes.Key = true;  
}
export function Index(name:string, value?:{Order?:number, IsUnique:boolean}) {   
    return function(target:any, propertyName:string){
        var type = Meta.Type.GetType(target);
        var property = type.GetProperty(propertyName);
        if (property === undefined)
            throw new Error(`Property(${propertyName}) has not been mapped to Type(${type.Name}).  Please add the @Map() decorator to ${type.Name} prior to the @Index decorator`);        

        var index = new Attributes.Index(name);
        if (value !== undefined){
            if (value.IsUnique !== undefined)
                index.IsUnique = value.IsUnique;
            if (value.Order !== undefined)
                index.Order = value.Order;
        }
        property.Attributes.Indexes.push(index);      
    }
}
export function Required(target:any, propertyName:string){
    var type = Meta.Type.GetType(target);
    var property = type.GetProperty(propertyName);
    if (property === undefined)
        throw new Error(`Property(${propertyName}) has not been mapped to Type(${type.Name}).  Please add the @Map() decorator to ${type.Name} prior to the @Required decorator`); 
    property.Attributes.Required = true;    
}
export function Match(pattern:string){
    return function(target:any, propertyName:string){
        var type = Meta.Type.GetType(target);
        var property = type.GetProperty(propertyName);
        if (property === undefined)
            throw new Error(`Property(${propertyName}) has not been mapped to Type(${type.Name}).  Please add the @Map() decorator to ${type.Name} prior to the @Match decorator`); 

        if (property.Type.Name !== "String")
            throw new Error(`Property(${property.Name}) an not have @Match applied because it is not mapped(@Map) to a String`);
        property.Attributes.Match = new Attributes.Match(pattern);
    }
}
export function Principal(target:any, propertyName:string){
    var type = Meta.Type.GetType(target);
    var property = type.GetProperty(propertyName);
    if (property === undefined)
        throw new Error(`Property(${propertyName}) has not been mapped to Type(${type.Name}).  Please add the @Map() decorator to ${type.Name} prior to the @Principal decorator`); 
    if (! type.IsSubTypeOf(Model))
        throw new Error(`Property(${propertyName}) cannot add the @Principal decorator to a non Model type`);
    property.Attributes.Principal = true;
}