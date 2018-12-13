import { Decorators, Collection } from "@lmstudios/data";
import { Model } from "../Model";
import { PersonEmail } from "./";

@Decorators.Model("STA.Data.Models.Email")
export class Email extends Model{
    public Address?:string;

    public PeopleEmails:Collection<PersonEmail> = new Collection(this, PersonEmail)
}