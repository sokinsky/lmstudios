import { Decorators } from "@lmstudios/data";
import { Model } from "../Model";

@Decorators.Model("STA.Data.Models.Phone")
export class Phone extends Model{
    public Number?:string;
}