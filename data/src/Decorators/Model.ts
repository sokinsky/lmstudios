import { Type } from "../";

export function Model(fullName:string, controllerType?:(()=>new(...args:any[])=>any)){
    var controllerType:(()=>new(...args:any[])=>any)|undefined = controllerType;  
    return function(target:any){  
        target.prototype.model = {
            FullName: fullName,
            Controller: controllerType
        }
        Type.ByName(fullName, target);
     }    
}