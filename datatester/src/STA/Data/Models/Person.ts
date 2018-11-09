import { Decorators, SubRepository } from "@lmstudios/data";
import { Model } from "../Model";
import { User, PersonEmail } from "./";

export class Person extends Model{
    @Decorators.Map(()=>String)
    public FirstName?:string;
    @Decorators.Map(()=>String)
    public LastName?:string;
    @Decorators.Map(()=>Date)
    public DOB?:Date;
    @Decorators.Map(()=>User, { Optional:false })
    public User?:User|Partial<User>;

    @Decorators.Map(()=>SubRepository)
    public PeopleEmails:SubRepository<PersonEmail> = new SubRepository(this, PersonEmail);

}