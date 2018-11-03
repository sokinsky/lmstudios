import { Meta } from "../";

export class Index{
    constructor(name:string, options?:{Order?:number,IsUnique?:boolean}){
        this.Name = name;
        if (options !== undefined){
            if (options.Order !== undefined)
                this.Order = options.Order;
            if (options.IsUnique !== undefined)
                this.IsUnique = options.IsUnique;
        }
    }
    public Name:string;
    public Order:number = 0;
    public IsUnique:boolean = true; 
}
export class Match {
    constructor(pattern:string){
        this.Patten = pattern;
    }
    public Patten:string;
}