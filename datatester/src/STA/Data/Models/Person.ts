import { Decorators, SubRepository } from "@lmstudios/data";
import { PersonController } from "../Controllers";
import { Model } from "../";
import { User, PersonEmail } from "./";

@Decorators.Model("STA.Data.Models.Person", ()=>PersonController)
export class Person extends Model{
    public FirstName?:string;
    public LastName?:string;
    public DOB?:Date;
    public User?:User|Partial<User>;

    public PeopleEmails:SubRepository<PersonEmail> = new SubRepository(this, PersonEmail);
}
