import { Meta, Attributes } from "../";
import { PropertyAttributes } from "../Meta/Property";


export function Controller(controllerType?:(()=>new(...args:any[])=>any)){
    var controllerType:(()=>new(...args:any[])=>any)|undefined = controllerType;     
    return function(target:any){
        var type = Meta.Type.GetType(target);
        if (controllerType !== undefined)
            type.Controller = Meta.Type.GetType(controllerType);
     }    
}