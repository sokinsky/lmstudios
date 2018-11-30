export function Context(name:string, url:string){  
    return function(target:any){
        target.prototype.context = {
            name:name,
            url:url
        };
     }    
}