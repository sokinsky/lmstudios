import { Model } from "../Model";
import { Meta } from "@lmstudios/entity";
import { Person } from "../Models";

export class User extends Model {
    @Meta.Decorators.Property(()=>String, {Unique:true})
    public Token?:string;
    @Meta.Decorators.Property(()=>String, {Unique:true})
    public Username?:string;
    @Meta.Decorators.Property(()=>String)
    public Password?:string;
    @Meta.Decorators.Property(()=>Person)
    public Person?:Person|Partial<Person>;
}