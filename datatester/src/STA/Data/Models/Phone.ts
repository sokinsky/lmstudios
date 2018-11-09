import { Decorators, SubRepository } from "@lmstudios/data";
import { Model } from "../Model";

export class Phone extends Model{
    @Decorators.Map(()=>String, {Indexes:["Number"], Match:"^\d{10}$"})
    public Number?:string;
}