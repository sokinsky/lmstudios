import { Type } from "./Type";

export function TypeDecorator(uid:string){
    return function(target:any){  
        console.log(target);
        console.log(typeof(target));
        target.prototype.typeUID = uid;
        Type.Create(target);      
    };
}