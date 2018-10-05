import * as Entity from "@lmstudios/entity";

export class Model extends Entity.Model {
    @Entity.Meta.Decorators.Property({Key:true})
    public ID?:number;
}