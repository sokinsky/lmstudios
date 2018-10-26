import * as LMSData from "@lmstudios/data";
import { Model } from "../Model";
import { User } from "./User";
import { PersonEmail } from "./PersonEmail";

export class Person extends Model{
    @LMSData.Meta.Decorators.Property(()=>String)
    public FirstName?:string;
    @LMSData.Meta.Decorators.Property(()=>String)
    public LastName?:string;
    @LMSData.Meta.Decorators.Property(()=>Date)
    public DOB?:Date;
    @LMSData.Meta.Decorators.Property(()=>User)
    public User?:User|Partial<User>;

    @LMSData.Meta.Decorators.Property(()=>LMSData.SubRepository)
    public PeopleEmails:LMSData.SubRepository<PersonEmail> = new LMSData.SubRepository(this, PersonEmail);

}