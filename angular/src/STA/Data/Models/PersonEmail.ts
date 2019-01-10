import * as LMSData from "@lmstudios/data";
import { Model } from "../";
import { Email, Person } from "./";


@LMSData.Decorators.Model("STA.Data.Models.PersonEmail")
export class PersonEmail extends Model {
	public Name?:string;
	public PersonID?:number;
	public Person?:Person|Partial<Person>;
	public EmailID?:number;
	public Email?:Email|Partial<Email>;
}