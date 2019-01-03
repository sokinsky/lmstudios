import { Collection, Decorators } from "@lmstudios/data";
import { Model } from "../Model";
import { Models } from "../";

@Decorators.Model("STA.Data.Models.Email")
export class Email extends Model{
    public Address?:string;
    public PeopleEmails?:Collection<Models.PersonEmail> = new Collection(this, Models.PersonEmail);
}