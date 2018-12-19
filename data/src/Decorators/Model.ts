import * as LMS from "../";
export function Model(fullName:string, controllerType?:(()=>new(...args:any[])=>any)){
    console.log(fullName);
    var controllerType:(()=>new(...args:any[])=>any)|undefined = controllerType;  
    return function(target:any){  
        target.prototype.model = {
            FullName: fullName,
            Controller: controllerType
        }
        // var type = LMS.Type.GetTypes().find(x=>{return x.FullName === fullName});
        // if (type === undefined){
        //     type = new LMS.Type(fullName, target);
        //     LMS.Type.GetTypes().push(type);
        // }
     }    
}