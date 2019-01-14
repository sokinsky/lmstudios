import { ModelDecorator } from "@lmstudios/data";
import { Model } from "../Model";
import { Models } from "../";

@ModelDecorator("STA.Data.Models.User")
export class User extends Model {
    public Token?:string;
    public Username?:string;
    public Password?:string;
}