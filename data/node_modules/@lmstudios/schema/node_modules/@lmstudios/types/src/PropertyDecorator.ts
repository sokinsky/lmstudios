import { Type } from "./Type";

export function PropertyDecorator(uid:string){
    return function(target:any){  
        console.log(typeof(target));
        target.prototype.typeUID = uid;
        Type.Create(target);      
    };
}