import * as Entity from "@lmstudios/entity";

export class Model extends Entity.Model {
    public ID?:number;

    public static get __properties():object{
        return {
            ID:{Type:Number, Attributes:[new Entity.Attributes.Key()]}
        }            
    }
}