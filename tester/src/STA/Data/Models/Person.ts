import { Model } from "../Model";
import { Meta } from "@lmstudios/entity";
import { User } from "./User";

export class Person extends Model{
    @Meta.Decorators.Property()
    public FirstName?:string;
    @Meta.Decorators.Property()
    public LastName?:string;
    @Meta.Decorators.Property(()=>Date)
    public DOB?:Date;
    @Meta.Decorators.Property(()=>User)
    public User?:User|Partial<User>;

}