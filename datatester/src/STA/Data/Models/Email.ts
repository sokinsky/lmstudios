import * as LMS from "@lmstudios/data";
import { Model } from "../Model";
import { PersonEmail } from "./";

@LMS.Data.Decorators.Model("STA.Data.Models.Email")
export class Email extends Model{
    public Address?:string;
    public PeopleEmails?:LMS.Data.Collection<PersonEmail> = new LMS.Data.Collection(this, PersonEmail);
}