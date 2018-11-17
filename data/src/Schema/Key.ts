export class Key {
    constructor(init:Partial<Key>){
        if (init.Name !== undefined)
            this.Name = init.Name;
        else
            throw new Error(`Invalid Key: Name is undefined`);
        if (init.Columns !== undefined)
            this.Columns = init.Columns;
    }
    public Name:string;
    public Columns:string[] = [];
}