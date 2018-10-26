import * as LMSData from "@lmstudios/data";
import { Model } from "../Model";

export class Email extends Model{
    @LMSData.Meta.Decorators.Property(()=>String)
    public Address?:string;
}