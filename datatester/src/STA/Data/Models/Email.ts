import * as LMS from "@lmstudios/data";
import { Model } from "../Model";
import { Models } from "../";

@LMS.Decorators.Model("STA.Data.Models.Email")
export class Email extends Model{
    public Address?:string;
    public PeopleEmails?:LMS.Collection<Models.PersonEmail> = new LMS.Collection(this, Models.PersonEmail);
}