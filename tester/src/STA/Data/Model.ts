import * as Entity from "@lmstudios/entity";

export class Model extends Entity.Model {
    @Entity.Meta.Decorators.Property(()=>Number, {Key:true})
    public ID?:number;
}