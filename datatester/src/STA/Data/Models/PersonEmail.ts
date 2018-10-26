import * as LMSData from "@lmstudios/data";
import { Model } from "../Model";
import { Person, Email } from "./";

export class PersonEmail extends Model{
    @LMSData.Meta.Decorators.Property(()=>String)
    public Name?:string;
    @LMSData.Meta.Decorators.Property(()=>Person)
    public Person?:Person|Partial<Person>;
    @LMSData.Meta.Decorators.Property(()=>Email)
    public Email?:Email|Partial<Email>;
}