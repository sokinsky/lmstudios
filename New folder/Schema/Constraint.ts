import { Property, Type, Reference,  } from './';
export class Constraint{
    constructor(property:Property, init:any){
        this.Property = property;       
        this.__init = init;
    }
    private __init:any;
    public Property:Property;
    public get From():Reference{
        return new Reference(this, this.__init.From);
    }
    public get To():Reference{
        return new Reference(this, this.__init.To);
    };
}