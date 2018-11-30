import { Decorators, } from "@lmstudios/data";
import { Model } from "../";
import { User, PersonEmail } from "./";

@Decorators.Model("STA.Data.Models.Person")
export class Person extends Model{
    public FirstName?:string;
    public LastName?:string;
    public DOB?:Date;
    public User?:User|Partial<User>;
}
