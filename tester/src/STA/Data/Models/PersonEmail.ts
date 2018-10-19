import { Model } from "../Model";
import { Meta } from "@lmstudios/entity";
import { Person, Email } from "./";

export class PersonEmail extends Model{
    @Meta.Decorators.Property(()=>String)
    public Name?:string;
    @Meta.Decorators.Property(()=>Person)
    public Person?:Person|Partial<Person>;
    @Meta.Decorators.Property(()=>Email)
    public Email?:Email|Partial<Email>;
}