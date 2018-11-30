import { Context, Model, Request, Response, Schema } from "./";

export class Repository<TModel extends Model> {
	public __internal:{
		context:Context,
		type:{
			constructor:(new (...args: any[]) => TModel),
			schema?:Schema.Type
		}
	}
	constructor(context:Context, type: (new (...args: any[]) => TModel)) {
		this.__internal = {
			context:context,
			type:{
				constructor:type
			}
		}
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
	public get Type(): Schema.Type|undefined{
		if (this.__internal.type.schema === undefined){
			if (this.__internal.context.Schema !== undefined){
				this.__internal.type.schema = this.__internal.context.Schema.GetType(this.__internal.type.constructor);
			}
		}
		return this.__internal.type.schema;
		
	}

    public Local: LocalRepository<TModel> = new LocalRepository(this);
	public Server: ServerRepository<TModel> = new ServerRepository(this);

	public Create():TModel{
		if (this.Type !== undefined){
			if (this.Type.Constructor !== undefined){
				var result = new this.Type.Constructor(this.__internal.context);
				return result;
			}
		}
		throw new Error(`Repository.Create was unable to create Model`);
	}
	public Add(value?:TModel|Partial<TModel>, server?:boolean):TModel{	
		if (value === undefined)
			value = this.Add({});	

		if (value instanceof Model) {
			if (value.GetType() !== this.Type)
				throw new Error(`Repository.Add():Unable to add value`);
			var existing = this.Items.find(x => { return x === value});
			if (existing === undefined)
				this.Items.push(value);
			return value;
		}
		else {
			var result = this.Local.Select(value);
			if (result === undefined){
				result = this.Create();
				result.Load(value, server);
				result = this.Add(result, server);
			}				
			return result;
		}
	}

	public async Select(value:Partial<TModel>):Promise<TModel|undefined> {
		var result = this.Local.Select(value);
		if (!result)
			await this.Server.Select(value);
		return this.Local.Select(value);
	}
	public async Search(value:Partial<TModel>):Promise<TModel[]>{
		if (value === undefined)
			return [];
		await this.Server.Search(value);
		return this.Local.Search(value);
	}
}
export class LocalRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
    public Repository: Repository<TModel>;

    public Select(value:Partial<TModel>) : TModel|undefined {
		return undefined;
	}
	public Search(...values:Partial<TModel>[]):TModel[]{
		if (values.length == 0)
			return [];
		return [];
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
		var response:Response = await request.Post(this.Repository.__internal.context.API);
		if (response.Result)
			this.Repository.__internal.context.Load(response.Result);
		return this.Repository.Local.Select(value);
	}
	public async Search(...values:Partial<TModel>[]):Promise<TModel[]>{
		if (this.Repository.Type === undefined)
			return [];

		var body = {
			Type:this.Repository.Type.Name,
			Values:values
		}
		var request:Request = new Request("Model/Search", body);
		var response = await request.Post(this.Repository.__internal.context.API);
		if (response !== undefined)
			this.Repository.__internal.context.Load(response.Result);
		return this.Repository.Local.Search(...values);
	}
}