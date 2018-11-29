import { Meta } from "../";
import { Controller } from "../";

export function Context(name:string, api:string){  
    return function(target:any){
        target.prototype.context = {
            name:name,
            api:api
        };
     }    
}