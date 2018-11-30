import { Property, Type, Reference,  } from './';
export class Constraint{
    constructor(property:Property, to:{Type:string, Properties:string[]}, from:{Type:string, Properties:string[]}){
        this.Property = property;
        this.To = new Reference(this, to.Type, to.Properties);
        this.From = new Reference(this, from.Type, from.Properties);
    }
    public Property:Property;
    public To:Reference;
    public From:Reference;

    public static Create(property:Property, constraintData:{To:{Type:string, Properties:string[]},From:{Type:string, Properties:string[]}}[]):Constraint[]{
        var results:Constraint[] = [];
        constraintData.forEach(data=>{
            results.push(new Constraint(property, data.To, data.From));
        });
        return results;
    }
}