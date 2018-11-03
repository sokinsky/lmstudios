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
    public get ParentFilter():any{
        var property = this.ParentProperty; 
        var keyProperty = this.Parent.GetType().Attributes.PrimaryKey;
        if (keyProperty === undefined)
            throw new Error(``);

        var value = keyProperty.GetValue(this.Parent);
        if (value === undefined)
            return undefined;

        var result:any = {};
        result[keyProperty.Name] = value;
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
        var model:TModel;
        if (item instanceof Model)
            model = item;
        else
            model = this.Repository.Create(item);        
        var parentProperty:Meta.Property = this.ParentProperty; 
        parentProperty.SetValue(model, this.Parent);
        return this.Repository.Add(model);
    }
}