import { Type } from "../";

export function Class(fullName:string){
    return function(target:any){  
        target.prototype.class = {
            FullName: fullName
        }
        Type.ByName(fullName, target);          
    }    
}