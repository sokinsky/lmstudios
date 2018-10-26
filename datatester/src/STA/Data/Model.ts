import * as LMSData from "@lmstudios/data";

export class Model extends LMSData.Model {
    @LMSData.Meta.Decorators.Property(()=>Number, {Key:true})
    public ID?:number;
}