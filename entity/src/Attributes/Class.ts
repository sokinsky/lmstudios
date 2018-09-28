import * as Reflection from "@lmstudios/reflection";

export function Class(fullName:string){
    return function(target:any){
         var type = Reflection.TypeCollection.GetType(target);
        type.FullName = fullName;
     }
}