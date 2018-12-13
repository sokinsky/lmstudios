import { Decorators, } from "@lmstudios/data";
import { Model } from "../";
import { User, PersonEmail } from "./";
import * as Controllers from "../Controllers";

@Decorators.Model("STA.Data.Models.Person", ()=>Controllers.Person)
export class Person extends Model{
    public FirstName?:string;
    public LastName?:string;
    public DOB?:Date;
    public User?:User|Partial<User>;
}
