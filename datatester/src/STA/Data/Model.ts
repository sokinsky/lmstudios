import { Model as Base } from "@lmstudios/data";
import { Decorators, Repository } from "@lmstudios/data";

export class Model extends Base {
    @Decorators.Map(()=>Number, { Key:true })
    public ID?:number;
}