import { Context, Controller, Model, Request, Response, ResponseStatus, SubRepository, Utilities } from "./";
import * as Bridge from "./Bridge";

import { Meta } from "./";
import { Guid, isJSON } from "./Utilities";
import { Property } from "./Meta";

export class Repository<TModel extends Model> {
	constructor(context: Context, type: (new (...args: any[]) => TModel)) {
		this.Context = context;
		this.Type = this.Context.GetType(type);
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
	public Type: Meta.Type;
	public get Key():Meta.Property{
		var result = this.Type.Key;
		if (result === undefined)
			throw new Error(`Invalid Key`);
		return result;
	}
    public Local: LocalRepository<TModel> = new LocalRepository(this);
	public Server: ServerRepository<TModel> = new ServerRepository(this);

	public BuildPartial(value:any):Partial<TModel>|undefined{	
		var result:Partial<TModel> = {};
		if (value === undefined)
			return result;
		switch (typeof(value)){
			case "string":
				if (isJSON(value)){					
					result = JSON.parse(value);
					return this.BuildPartial(result);
				}					
				switch (this.Key.Type.Name){
					case "String":
						if (this.Key.Attributes.Match === undefined)
							this.Key.SetValue(result, value);
						else{
							if ((<string>value).match(this.Key.Attributes.Match) !== undefined)
								this.Key.SetValue(result, value);
							else
								return undefined;
						}
						break;
					case "Number":
						var intParsed = parseInt(value.toString());
						if (! isNaN(intParsed))
							this.Key.SetValue(result, intParsed);
						break;
				}				
				return this.BuildPartial(result);
			case "number":
				switch (this.Key.Type.Name){
					case "String":
						return this.BuildPartial(value.toString());
					case "Number":
						this.Key.SetValue(result, <number>value);
						break;
				}	
				return this.BuildPartial(result);
			case "object":
				for (var propertyName in value){
					var property = this.Type.GetProperty(propertyName);
					if (property !== undefined)
						property.SetValue(result, property.GetValue(value));
				}
				return result;
		}
		return undefined;
	}
	public Create():TModel{
		var result = new this.Type.Constructor();
		return result;
	}
	public Add(value?:TModel|Partial<TModel>|number|string, server?:boolean):TModel{	
		if (value === undefined)
			value = {};	
		switch (typeof(value)){
			case "string":
				return this.Add(this.BuildPartial(<string>value));
			case "number":
				return this.Add(this.BuildPartial(<number>value));
			case "object":
				if (value instanceof Model){
					if (value.GetType() !== this.Type)
						throw new Error(``);
					var select = this.Local.Select(value);
					if (select === undefined){
						this.Items.push(value);
						this.Context.ChangeTracker.Add(value);
					}						
					return value;
				}
				else {
					var select = this.Local.Select(value);
					//console.log(select);
					if (select === undefined){
						select = new this.Type.Constructor();
						if (select !== undefined){
							select.Load(value, server);
							return this.Add(select, server);
						}
					}
					
					if (select !== undefined)
						return select;
				}
				break;
		}
		throw new Error(``);
	}

	public async Select(value:TModel|Partial<TModel>|number|string):Promise<TModel|undefined> {
		var result:TModel|undefined = this.Local.Select(value);
		if (!result)
			result = await this.Server.Select(value);
		return result;
	}
	public async Search(value:TModel|Partial<TModel>|number|string|undefined):Promise<TModel[]>{
		if (value === undefined)
			return [];
		switch (typeof(value)){
			case "object":
				if (value instanceof Model)
					return this.Search(<any>value.Controller.Values.Actual.Data);
				var result = await this.Server.Search(value);
				return this.Local.Search(value);
			default:
				return this.Search(this.BuildPartial(value));
		}
	}
}
export class LocalRepository<TModel extends Model> {
    constructor(parent: Repository<TModel>) {
        this.Parent = parent;
    }
    public Parent: Repository<TModel>;

    public Select(value:Partial<TModel>|number|string|undefined) : TModel|undefined {
		if (value === undefined)
			return undefined;
		var result:TModel|undefined;
		switch (typeof(value)){
			case "object":
				if (value instanceof Model)
					return this.Select(<any>value.Controller.Values.Actual.Data);

				var filter:any;
				var filters:any[] = [];
				if (this.Parent.Key.GetValue(value) !== undefined){
					filter = {};
					this.Parent.Key.SetValue(filter, this.Parent.Key.GetValue(value));
					filters.push(filter);
				}
				for (var name in this.Parent.Type.Indexes){
					filter = {};
					var properties = this.Parent.Type.Indexes[name];
					properties.forEach(property=>{
						this.Parent.Key.SetValue(filter, this.Parent.Key.GetValue(value));
					});
					filters.push(filter);
				}
				filters.forEach(filter =>{
					if (result != undefined)
						return;
					var searchResults = this.Search(filter);
					if (searchResults.length == 1){
						result = searchResults[0];
					}						
				});
				return result;
			default:
				return this.Select(this.Parent.BuildPartial(value));
		}
	}
	public Search(value:TModel|Partial<TModel>|number|string|undefined):TModel[]{
		if (value === undefined)
			return [];
		var result:TModel[] = [];
		switch (typeof(value)){
			case "object":
				if (value instanceof Model)
					return this.Search(<any>value.Controller.Values.Actual.Data);
				
				var filter:any = value;
				result = this.Parent.Items.filter(item => {
					for(var key in filter){
						if (filter[key] !== (<any>item.Controller.Values.Actual.Data)[key])
							return false;			
					}
					return true;
				});
				return result;
			default:
				return this.Search(this.Parent.BuildPartial(value));
		}
	}
}
export class ServerRepository<TModel extends Model> {
    constructor(parent: Repository<TModel>) {
        this.Parent = parent;
    }
	public Parent: Repository<TModel>;
	public async Select(value: Partial<TModel>|number|string) : Promise<TModel|undefined> {
		var body = {
			Type: this.Parent.Type.Name,
			Value: value
		};
		var request:Request = new Request("Model/Select", body);
		var response:Response = await request.Post(this.Parent.Context.API);
		if (response.Result)
			this.Parent.Context.Load(response);
		return this.Parent.Local.Select(value);
	}
	public async Search(value:Partial<TModel>|number|string):Promise<TModel[]>{
		var body = {
			Type: this.Parent.Type.Name,
			Value: value
		}
		var request:Request = new Request("Model/Search", body);
		var response = await request.Post(this.Parent.Context.API);
		if (response !== undefined)
			this.Parent.Context.Load(response);
		return this.Parent.Local.Search(value);
	}
}