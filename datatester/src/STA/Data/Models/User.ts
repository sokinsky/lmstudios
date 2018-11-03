import { Decorators, SubRepository } from "@lmstudios/data";
import { Model } from "../Model";
import { Person } from "../Models";

export class User extends Model {
    @Decorators.Index("IX_Token")
    @Decorators.Map(()=>String)
    public Token?:string;
    @Decorators.Index("IX_Username")
    @Decorators.Map(()=>String)
    public Username?:string;
    @Decorators.Map(()=>String)
    public Password?:string;
    
    @Decorators.Principal
    @Decorators.Map(()=>Person)
    public Person?:Person|Partial<Person>;
}