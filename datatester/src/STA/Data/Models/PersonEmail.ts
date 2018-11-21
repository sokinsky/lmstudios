import { Decorators, SubRepository } from "@lmstudios/data";
import { Model } from "../Model";
import { Person, Email } from "./";

export class PersonEmail extends Model{
    public Name?:string;
    public Person?:Person|Partial<Person>;
    public Email?:Email|Partial<Email>;
}