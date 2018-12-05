import { Decorators } from "@lmstudios/data";
import { Model } from "../Model";

@Decorators.Model("STA.Data.Models.Email")
export class Email extends Model{
    public Address?:string;
}