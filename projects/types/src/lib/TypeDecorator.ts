import { Type } from "./Type";

export function TypeDecorator(uid:string){
    console.log(uid);
    return function(target:any){  
        target.prototype.typeUID = uid;
        Type.Create(target);      
        console.log("here");
    };
}