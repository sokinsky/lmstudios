import { Context, Model, Request, Response, Schema } from "./";
import { ChangeStatus } from "./ChangeEntry";

export class Repository<TModel extends Model> {
	constructor(context:Context, type: (new (...args: any[]) => TModel)) {
		this.Context = context;
		if (type.prototype.decoration === undefined)
			throw new Error(`'${type.prototype.constructor.name}' was not decorated`);	
		this.Type = this.Context.GetType(type.prototype.decoration.type.name);
		this.Type.Constructor = type;
	}
	private __items:TModel[] = [];
	public get Items():TModel[]{
		return this.__items;
	}
	public *[Symbol.iterator]() {
		for (const value of this.Items) {
			yield value;
		}
	}
	public Context:Context;
	public Type:Schema.Type;
	public Name:string = "";

    public Local: LocalRepository<TModel> = new LocalRepository(this);
	public Server: ServerRepository<TModel> = new ServerRepository(this);

	public Create():TModel{
		if (this.Type.Constructor !== undefined){
			var result = new this.Type.Constructor(this.Context);
			return result;
		}
		throw new Error(`Repository.Create was unable to create Model`);
	}
	public Add(value?:TModel|Partial<TModel>, fromServer?:boolean):TModel{	
		if (value === undefined)
			value = this.Add({});
		var result:TModel|undefined = undefined;	
		if (! (value instanceof Model)){
			result = this.Local.Select(value);
			if (result === undefined){
				result = this.Create();
				result.Load(value, fromServer);
				return this.Add(result, fromServer);
			}	
		}
		if (value instanceof Model){
			if (value.GetType() !== this.Type)
				throw new Error(`Repository.Add():Model(${value.GetType().Name}) is not valid in Repository<${this.Type.Name}>`);
			var exists = this.Items.find(x => { return x === value});
			if (exists === undefined){
				this.Items.push(value);
			}
			
			if (fromServer === true)
				value.__controller.__status.Change.Model = ChangeStatus.Unchanged;
			else
				value.__controller.__status.Change.Model = ChangeStatus.Added;
			return value;
		}	
		throw Error(``);
	}

	public async Select(value:Partial<TModel>):Promise<TModel|undefined> {
		var result = this.Local.Select(value);
		if (!result)
			result = await this.Server.Select(value);
		return result;
	}
	public async Search(...values:any[]):Promise<TModel[]>{
		if (values === undefined || values.length === 0)
			return [];

		await this.Server.Search(...values);
		return this.Local.Search(...values);
	}
}
export class LocalRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
	public Repository: Repository<TModel>;
	public get Items():TModel[]{
		return this.Repository.Items;
	}
	public get Type():Schema.Type{
		return this.Repository.Type;
	}


    public Select(value:Partial<TModel>) : TModel|undefined {				
		var filter:Partial<TModel> = {};
		this.Repository.Type.PrimaryKey.Properties.forEach(property =>{
			property.SetValue(filter, property.GetValue(value));
		})
		var results = this.Search(filter);		
		if (results.length === 1)
			return results[0];
		
		this.Repository.Type.AdditionalKeys.forEach(key =>{
			filter = {};
			key.Properties.forEach(property=>{
				property.SetValue(filter, property.GetValue(value));
			})
			results = this.Search(filter);
			if (results.length === 1)
				return results[0];
		});
		return undefined;
	}
	public Search(...values:any[]):TModel[]{
		var results:TModel[] = [];
		for (let value of values){
			for (let item of this.Repository.Items){
				var include = true;
				for (var propertyName in value){
					var property = this.Type.GetProperty(propertyName);
					if (property !== undefined){
						if (property.GetValue(item) !== property.GetValue(value))
							include = false;
					}	
				}
				if (include){
					var included = results.find(x => { return (x === item); });
					if (!included)
						results.push(item);									
				}	
			}			
		}
		return results;
	}
}
export class ServerRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
	public Repository: Repository<TModel>;
	public async Select(value: Partial<TModel>) : Promise<TModel|undefined> {
		if (this.Repository.Type === undefined)
			return undefined;
		var body = {
			Type: this.Repository.Type.Name,
			Value: value
		};
		var request:Request = new Request("Model/Select", body);
		var response:Response = await request.Post(this.Repository.Context.API);
		if (response.Result)
			this.Repository.Context.Load(response.Result);
		return this.Repository.Local.Select(value);
	}
	public async Search(...values:any[]):Promise<TModel[]>{
		if (this.Repository.Type === undefined)
			return [];
		var body = {
			Type:this.Repository.Type.Name,
			Values:values
		}
		var request:Request = new Request("Model/Search", body);
		var response = await request.Post(this.Repository.Context.API);
		if (response !== undefined)
			this.Repository.Context.Load(response.Result);
		return this.Repository.Local.Search(...values);
	}
}