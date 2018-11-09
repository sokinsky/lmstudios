import * as LMS from "@lmstudios/entity";
import { Model } from "../Model";
import { User } from "./User";
import { PersonEmail } from "./PersonEmail";

export class Person extends Model{
    @LMS.Meta.Decorators.Property(()=>String)
    public FirstName?:string;
    @LMS.Meta.Decorators.Property(()=>String)
    public LastName?:string;
    @LMS.Meta.Decorators.Property(()=>Date)
    public DOB?:Date;
    @LMS.Meta.Decorators.Property(()=>User, {Optional:true})
    public User?:User|Partial<User>;

    @LMS.Meta.Decorators.Property(()=>LMS.List)
    public PeopleEmails:LMS.List<PersonEmail> = new LMS.List(this, PersonEmail);

}