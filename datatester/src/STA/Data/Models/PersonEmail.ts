import { Decorators } from "@lmstudios/data";
import { Model } from "../Model";
import { Person, Email } from "./";

@Decorators.Model("STA.Data.Models.PersonEmail")
export class PersonEmail extends Model{
    public Name?:string;
    public Person?:Person|Partial<Person>;
    public Email?:Email|Partial<Email>;
}