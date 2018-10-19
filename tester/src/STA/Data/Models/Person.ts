import { Model } from "../Model";
import { Meta, Repository } from "@lmstudios/entity";
import { User } from "./User";
import { PersonEmail } from "./PersonEmail";

export class Person extends Model{
    @Meta.Decorators.Property(()=>String)
    public FirstName?:string;
    @Meta.Decorators.Property(()=>String)
    public LastName?:string;
    @Meta.Decorators.Property(()=>Date)
    public DOB?:Date;
    @Meta.Decorators.Property(()=>User)
    public User?:User|Partial<User>;

    @Meta.Decorators.Property(()=>Repository)
    public PeopleEmails:Repository<PersonEmail> = new Repository(this, PersonEmail);

}