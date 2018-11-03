import { Decorators } from "@lmstudios/data";
import { Model } from "../Model";

export class Email extends Model{
    @Decorators.Match("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
    @Decorators.Index("IX_Address")
    @Decorators.Map(()=>String)
    public Address?:string;
}