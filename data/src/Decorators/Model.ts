import { Controller } from "../";

export function Model(name:string, controllerType?:(()=>new(...args:any[])=>any)){
    var controllerType:(()=>new(...args:any[])=>any)|undefined = controllerType;     
    return function(target:any){        
        target.prototype.decoration = {
            type: {
                name:name,
                controller:(()=>Controller)
            }
        }
        if (controllerType !== undefined)
            target.prototype.decoration.type.controller = controllerType;
     }    
}