import { Decorators } from "@lmstudios/data";
import { Model, Controllers, Models } from "../";

console.log("STA.Data.Models.Person");
@Decorators.Model("STA.Data.Models.Person")
export class Person extends Model {
    public FirstName?:string;
    public LastName?:string;
    public DOB?:Date;
    public User?:Models.User|Partial<Models.User>;
}
