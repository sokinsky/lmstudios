import { Type } from "@lmstudios/types";

export function ModelDecorator(uid:string, controllerType?:(()=>new(...args:any[])=>any)){
    var controllerType:(()=>new(...args:any[])=>any)|undefined = controllerType;  
    return function(target:any){  
        target.prototype.typeUID = uid;
        target.prototype.modelController = controllerType;
        Type.Create(target);
              
    }    
}