import { Context, Controller, Model, Request, Response, ResponseStatus, SubRepository, Utilities } from "./";
import * as Bridge from "./Bridge";

import { Meta } from "./";
import { Guid, isJSON } from "./Utilities";
import { Property } from "./Meta";

export class Repository<TModel extends Model> {
	constructor(type: (new (...args: any[]) => TModel)) {
		this.Type = this.Context.GetType(type);
	}
	private __items:TModel[] = [];
	public get Items():TModel[]{
		return this.__items;
	}
	public *[Symbol.iterator]() {
		for (const value of this.Items) {
			if (value.Controller.Values.Server.Data === undefined)
				value.Refresh();
			yield value;
		}
	}
	public Type: Meta.Type;
	public get Context(): Context{
		return <Context>(<any>window)["Context"];
	}	

    public Local: LocalRepository<TModel> = new LocalRepository(this);
	public Server: ServerRepository<TModel> = new ServerRepository(this);

	public Create():TModel{
		var result = new this.Type.Constructor();
		return result;
	}
	public Add(value?:TModel|Partial<TModel>, server?:boolean):TModel{	
		if (value === undefined)
			value = this.Add({});	

		if (value instanceof Model) {
			var existing = this.Items.find(x => { return x === value});
			if (existing == null){
				this.Items.push(value);
				this.Context.ChangeTracker.Add(value);
			}
			return value;
		}
		else {
			var result = this.Local.Select(value);
			if (result === undefined){
				var newModel = new this.Type.Constructor();
				newModel.Load(value, server);
				result = this.Add(newModel, server);
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
	public async Search(value:Partial<TModel>):Promise<Set<TModel>>{
		if (value === undefined)
			return new Set<TModel>();
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
	public Search(...values:Partial<TModel>[]):Set<TModel>{
		if (values.length == 0)
			return new Set<TModel>();

		var result:Set<TModel> = new Set<TModel>();
		values.forEach(value=>{
			this.Repository.Items.filter(item =>{
				for (var propertyName in value){
					var actual:any = item.Controller.Values.Actual.Data;
					if (actual[propertyName] !== value[propertyName])
						return false;
				}
				return true;
			}).forEach(item =>{
				result.add(item);
			})
		});
		return result;
	}
}
export class ServerRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
	public Repository: Repository<TModel>;
	public async Select(value: Partial<TModel>) : Promise<TModel|undefined> {
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
	public async Search(...values:Partial<TModel>[]):Promise<Set<TModel>>{
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