import { Decorators } from "@lmstudios/data";
import { Model } from "../Model";

export class Email extends Model{
    @Decorators.Map(()=>String, { Indexes:["Address"], Match:"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"})
    public Address?:string;
}