import * as LMSData from "@lmstudios/data";
import { Model } from "../";
import { PersonEmail, User } from "./";


@LMSData.Decorators.Model("STA.Data.Models.Person")
export class Person extends Model {
	public FirstName?:string;
	public MiddleName?:string;
	public LastName?:string;
	public DOB?:Date;
	public User?:User|Partial<User>;
	public PeopleEmails?:LMSData.Collection<PersonEmail> = new LMSData.Collection(this, PersonEmail);
}