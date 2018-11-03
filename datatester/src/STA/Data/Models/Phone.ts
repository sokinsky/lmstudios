import { Decorators, SubRepository } from "@lmstudios/data";
import { Model } from "../Model";

export class Phone extends Model{
    @Decorators.Match("^\d{10}$")
    @Decorators.Index("IX_Number")
    @Decorators.Map(()=>String)
    public Number?:string;
}