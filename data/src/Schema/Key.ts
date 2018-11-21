export class Key {
    constructor(init:Partial<Key>){
        if (init.Name !== undefined)
            this.Name = init.Name;
        if (init.Properties !== undefined)
            this.Properties = init.Properties;
    }
    public Name:string = "";
    public Properties:string[] = [];
}