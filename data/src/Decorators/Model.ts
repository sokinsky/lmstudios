import * as LMS from "../";

export function Model(fullName:string, controllerType?:(()=>new(...args:any[])=>any)){
    var controllerType:(()=>new(...args:any[])=>any)|undefined = controllerType;  
    return function(target:any){        
        target.prototype.model = {
            FullName: fullName,
            Controller: controllerType
        }
        var type = LMS.Type.GetType(fullName);
        type.Constructor = target;  
     }    
}