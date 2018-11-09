import { Meta } from "../";

export class Controller{
    constructor(type:Meta.Type){
        this.Type = type;
    }
    public Type:Meta.Type;
}
export class Reference{
    constructor(required?:boolean){
        if (required !== undefined)
            this.Required = required;
    }
    public Required:boolean = true;
}