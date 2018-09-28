import * as Entity from "@lmstudios/entity";

@Entity.Attributes.Class("STA.Data.Model")
export class Model extends Entity.Model {
    @Entity.Attributes.Property(Number, {Key:true})
    public ID?:number;
}