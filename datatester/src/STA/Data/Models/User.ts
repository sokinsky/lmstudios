import { Model } from "../Model";
import * as LMSData from "@lmstudios/data";
import { Person } from "../Models";

export class User extends Model {
    @LMSData.Meta.Decorators.Property(()=>String, {Unique:true})
    public Token?:string;
    @LMSData.Meta.Decorators.Property(()=>String, {Unique:true})
    public Username?:string;
    @LMSData.Meta.Decorators.Property(()=>String)
    public Password?:string;
    @LMSData.Meta.Decorators.Property(()=>Person)
    public Person?:Person|Partial<Person>;
}