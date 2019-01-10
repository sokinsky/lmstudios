import * as LMSData from "@lmstudios/data";
import { Model } from "../";
import { Person } from "./";


@LMSData.Decorators.Model("STA.Data.Models.User")
export class User extends Model {
	public ID?:number;
	public Username?:string;
	public Password?:string;
	public Person?:Person|Partial<Person>;
}