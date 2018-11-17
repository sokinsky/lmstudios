import { Context, Property, PropertyType, ColumnProperty, ReferenceProperty, Key } from "./";

export class Model {
    constructor(context:Context, init:Partial<Model>){
        if (init.Name == undefined || init.TableName === undefined)
            throw new Error(``);
        this.Context = context;
        this.Name = init.Name;
        this.TableName = init.TableName;
        if (init.Keys !== undefined){
            init.Keys.forEach(key =>{
                this.Keys.push(new Key(key));
            })
        }
        if (init.Properties !== undefined){
            init.Properties.forEach(property =>{
                if (property.Type !== undefined){
                    switch (property.Type){
                        case PropertyType.Column:
                            this.Properties.push(new ColumnProperty(this, property));
                            break;
                        case PropertyType.Reference:
                            this.Properties.push(new ReferenceProperty(this, property));
                            break;
                        default:
                            throw new Error(``);
                    }
                }
            })
        }
        console.log(this);
    }
    public Context:Context;
    public Name:string;
    public TableName:string;
    public Keys:Key[] = [];
    public Properties:Property[] = [];
}
