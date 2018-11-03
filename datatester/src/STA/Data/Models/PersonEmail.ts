import { Decorators, SubRepository } from "@lmstudios/data";
import { Model } from "../Model";
import { Person, Email } from "./";

export class PersonEmail extends Model{
    @Decorators.Map(()=>String)
    public Name?:string;
    @Decorators.Map(()=>Person)
    public Person?:Person|Partial<Person>;
    @Decorators.Map(()=>Email)
    public Email?:Email|Partial<Email>;
}