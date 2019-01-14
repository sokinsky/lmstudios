import { ModelDecorator } from "@lmstudios/data";
import { Model } from "../Model";
import { Models } from "../";

@ModelDecorator("STA.Data.Models.Person")
export class Person extends Model {
    public FirstName?:string;
    public LastName?:string;
    public DOB?:Date;
}
