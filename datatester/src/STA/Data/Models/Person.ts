import * as LMS from "@lmstudios/data";
import { Model as Base } from "../Model";
import { User, PersonEmail } from "./";


@LMS.Decorators.Model("STA.Data.Models.Person")
export class Person extends Base {
    public FirstName?:string;
    public LastName?:string;
    public DOB?:Date;
    public User?:User|Partial<User>;

    public PeopleEmails:LMS.Collection<PersonEmail> = new LMS.Collection(this, PersonEmail);
}
