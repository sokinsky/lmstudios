import * as Entity from "@lmstudios/entity";
import * as Base from "../Model";


export class Person extends Base.Model{
    public FirstName?:string;
    public LastName?:string;

    public static get __properties():object{
        return {
            FirstName:{Type:String },
            LastName:{Type:String }
        }            
    }
}