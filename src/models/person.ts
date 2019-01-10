import { Type } from "../../projects/types/src/public_api";
import { TypeDecorator } from "../../projects/types/src/public_api";

TypeDecorator("STA.Data.Models.Person")
export class Person {
    constructor(){
        console.log(Type.Create("LMSData.Collection<STA.Data.Models.Person>"));
    }
    public FirstName:string = "Steve";
    
}
