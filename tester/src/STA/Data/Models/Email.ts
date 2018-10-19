import { Model } from "../Model";
import { Meta } from "@lmstudios/entity";

export class Email extends Model{
    @Meta.Decorators.Property(()=>String)
    public Address?:string;
}