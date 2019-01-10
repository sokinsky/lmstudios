export { Guid } from "./Guid";

export function isJSON(value:string){
    try { JSON.parse(value)}
    catch(e) {return false;}
    return true;
}