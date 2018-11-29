import { Meta } from "../";
import { Controller } from "../";

export function Model(name:string, controllerType?:(()=>new(...args:any[])=>any)){
    var controllerType:(()=>new(...args:any[])=>any)|undefined = controllerType;     
    return function(target:any){
        target.prototype.type = {
            name:name
        };
        if (controllerType !== undefined)
            target.prototype.controller = controllerType;
        else
            target.prototype.controller = (()=>Controller)
        var type = Meta.Type.GetType(target);
     }    
}