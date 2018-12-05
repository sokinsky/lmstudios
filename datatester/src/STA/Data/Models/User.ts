import { Decorators } from "@lmstudios/data";
import { Model } from "../Model";
import { Person } from "../Models";

@Decorators.Model("STA.Data.Models.User")
export class User extends Model {
    public Token?:string;
    public Username?:string;
    public Password?:string;
    public Person?:Person|Partial<Person>;
}