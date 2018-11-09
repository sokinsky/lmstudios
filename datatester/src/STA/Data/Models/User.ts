import { Decorators, SubRepository } from "@lmstudios/data";
import { Model } from "../Model";
import { Person } from "../Models";

export class User extends Model {
    @Decorators.Map(()=>String, {Indexes:["Token"]})
    public Token?:string;

    @Decorators.Map(()=>String, {Indexes:["Username"]})
    public Username?:string;

    @Decorators.Map(()=>String)
    public Password?:string;

    @Decorators.Map(()=>Person, { Required:true })
    public Person?:Person|Partial<Person>;
}