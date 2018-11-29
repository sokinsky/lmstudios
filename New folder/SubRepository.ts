import { Meta } from ".";
import { Model, Repository } from ".";

export class SubRepository<TModel extends Model> {
	constructor(parent: Model, type: (new (...args: any[]) => TModel)) {
        this.Parent = parent;
        this.Repository = <Repository<TModel>>this.Parent.Context.GetRepository(type);
    }
    public Parent:Model;
    public get ParentProperty():Meta.Property{
        var parentType = this.Parent.GetType();
        var parentProperties = this.Repository.Type.GetProperties().filter(x => {
            return x.Type === parentType;
        });	
        switch (parentProperties.length){
            default:
                throw new Error(`Ambiguous:Type(${this.Repository.Type.Name}) contains multiple properties with Type(${parentType.Name})`);
            case 0:
                throw new Error(`Invalid:Type(${this.Repository.Type.Name}) contains no properties with Type(${parentType.Name})`);
            case 1:
                return parentProperties[0];
        }
    }
    public Name:string = "";
    public get ParentFilter():any{
        var property = this.ParentProperty; 
        var value = this.Parent.Key.Value;
        if (value === undefined)
            return undefined;

        var result:any = {};
        result[this.Parent.Key.Property.Name] = value;
        return result;       
    }
    public Repository:Repository<TModel>;
    public Initializing?:Date;
    public Initialized?:Date;  

	public get Items():TModel[]{
        this.Initialize();
          return this.Repository.Local.Search(this.ParentFilter);
	}
	public *[Symbol.iterator]() {
		for (const value of this.Items) {
            yield value;
		}
    } 
    public get length(){
        return this.Items.length;
    }

    public async Initialize(){
        if (this.Initializing === undefined){
            this.Initializing = new Date();
            await this.Repository.Search(this.ParentFilter);
            this.Initialized = new Date();
        }
    }
	public Add(item:TModel|Partial<TModel>):TModel {
        var model = this.Repository.Add(item);        
        var parentProperty:Meta.Property = this.ParentProperty; 
        parentProperty.SetValue(model, this.Parent);
        return this.Repository.Add(model);
    }

    public toString():string{
        return this.Name;
    }
}