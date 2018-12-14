import * as LMS from "../";

export function Type(fullName:string){
    return function(target:any){  
        var type = LMS.Type.GetType(fullName);
        if (type === undefined)
            LMS.Type.Create(fullName, target);
    }    
}