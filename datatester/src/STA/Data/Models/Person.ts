import { Decorators, Collection } from "@lmstudios/data";
import { Model } from "../Model";
import { Models } from "../";

@Decorators.Model("STA.Data.Models.Person")
export class Person extends Model {
    public FirstName?:string;
    public LastName?:string;
    public DOB?:Date;
    public User?:Models.User|Partial<Models.User>;

    public PeopleEmails:Collection<Models.PersonEmail> = new Collection(this, Models.PersonEmail);
}
