import { ModelDecorator } from "@lmstudios/data";
import { Model } from "../Model";
import { Models } from "../";

@ModelDecorator("STA.Data.Models.PersonEmail")
export class PersonEmail extends Model{
    public Name?:string;
    public Person?:Models.Person|Partial<Models.Person>;
    public Email?:Models.Email|Partial<Models.Email>;
}