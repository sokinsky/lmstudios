import { Decorators, SubRepository } from "@lmstudios/data";
import { Model } from "../Model";
import { Person } from "../Models";

export class User extends Model {
    public Token?:string;
    public Username?:string;
    public Password?:string;
    public Person?:Person|Partial<Person>;
}