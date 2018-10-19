export class Attributes {
    constructor(init?:Partial<Attributes>){
        if (init){
            for (var key in init){
                (<any>this)[key] = (<any>init)[key];
            }
        }
    }
    public Key:boolean = false;
    public Unique:boolean = false;    
    public Required:boolean = false;
    public Index?:{Name:string,Order:number,Unique:boolean};
}