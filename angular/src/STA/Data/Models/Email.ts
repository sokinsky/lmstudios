import { ModelDecorator } from "@lmstudios/data";
import { Model } from "../Model";
import { Models } from "../";

@ModelDecorator("STA.Data.Models.Email")
export class Email extends Model{
    public Address?:string;
}