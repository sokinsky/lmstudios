import * as LMSData from "@lmstudios/data";
import { Model } from "../";


@LMSData.Decorators.Model("STA.Data.Models.Email")
export class Email extends Model {
	public Address?:string;
}