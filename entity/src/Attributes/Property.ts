import * as Reflection from "@lmstudios/reflection";

export function Property(type:string|(new (...args:any[])=>any), init?:{Key?:boolean, Unique?:boolean}){
    return function(target:any, propertyName:string){
        if (! type || typeof(type) === "string"){
           console.log(propertyName);
        }
        else{
            var classType = Reflection.TypeCollection.GetType(target.constructor);
            var propertyType = Reflection.TypeCollection.GetType(type);
            var property = classType.GetProperty(propertyName);
            if (! property){
                property = new Reflection.PropertyInfo(propertyName, propertyType);
                classType.Properties.push(property);
            }
        }      


     }
      
}