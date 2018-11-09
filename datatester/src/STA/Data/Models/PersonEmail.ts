import { Decorators, SubRepository } from "@lmstudios/data";
import { Model } from "../Model";
import { Person, Email } from "./";

export class PersonEmail extends Model{
    @Decorators.Map(()=>String)
    public Name?:string;
    @Decorators.Map(()=>Person, { Indexes:["PersonEmail"], Required:true })
    public Person?:Person|Partial<Person>;
    @Decorators.Map(()=>Email, { Indexes:["PersonEmail"], Required:true })
    public Email?:Email|Partial<Email>;
}