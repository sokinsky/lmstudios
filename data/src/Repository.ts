import { Context, Controller, Model, Request, Response, ResponseStatus, SubRepository, Utilities } from "./";
import * as Bridge from "./Bridge";

import { Meta } from "./";
import { Guid } from "./Utilities";
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
    public Local: LocalRepository<TModel> = new LocalRepository(this);
	public Server: ServerRepository<TModel> = new ServerRepository(this);

	public BuildPartial(value:string|number):Partial<TModel>{
		var keyProperty:Property|undefined = this.Type.Attributes.PrimaryKey;
		if (keyProperty === undefined)
			throw new Error(`Type(${this.Type.Name}) does not have a Primary Key`);
		
		var result:Partial<TModel> = {};
		switch (keyProperty.Name){
			case "String":
				switch (typeof(value)){
					case "string":
						keyProperty.SetValue(result, value);						
						break;
					case "number":
						keyProperty.SetValue(result, value.toString());
						break;
				}
				break;
			case "Number":
				var intParsed = parseInt(value.toString());
				if (! isNaN(intParsed))
					keyProperty.SetValue(result, intParsed);
				break;
		}
		return result;
	}
	public Create(value:Partial<TModel>|number|string):TModel{
		switch (typeof(value)){
			case "string":
				return this.Create(this.BuildPartial(<string>value));
			case "number":
				return this.Create(this.BuildPartial(<number>value));
			case "object":
				var result:TModel = new this.Type.Constructor();
				result.Controller.Load(value);

				
				var principalProperty = this.Type.GetProperties().find(x => {return x.Attributes.Principal});
				if (principalProperty !== undefined){
					if (principalProperty.GetValue(result) === undefined){
						var principalRepository = this.Context.GetRepository(principalProperty.Type.Name);
						var principalValue = principalRepository.Add({});
						principalProperty.SetValue(result, principalValue);
					}

						
				}
				


				return result;			
		}
		throw new Error(``);
	}
	public Add(value:TModel|Partial<TModel>|number|string):TModel{		
		switch (typeof(value)){
			case "string":
				return this.Add(this.BuildPartial(<string>value));
			case "number": 
				return this.Add(this.BuildPartial(<number>value));
			case "object":
				var check;
				if (value instanceof Model){
					if (value.GetType() !== this.Type)
						throw new Error(``);
					else{
						check = this.__items.find(x => x === value);
						if (check === undefined){
							this.__items.push(value);
							this.Context.ChangeTracker.Add(value);
							return value;
						}
						return check;
					}
				}
				else{
					check = this.Local.Select(value);
					if (check === undefined){
						check = this.Create(value);
						return this.Add(check);
					}
					return check;
				}
			default:
				throw new Error(``);
		}		
	}

	public async Select(value:Partial<TModel>|number|string):Promise<TModel|undefined> {
		var result:TModel|undefined = this.Local.Select(value);
		if (!result)
			result = await this.Server.Select(value);
		return result;
	}
	public async Search(value:Partial<TModel>|number|string):Promise<TModel[]>{
		await this.Server.Search(value);
		return this.Local.Search(value);
	}
}
export class LocalRepository<TModel extends Model> {
    constructor(parent: Repository<TModel>) {
        this.Parent = parent;
    }
    public Parent: Repository<TModel>;

    public Select(value:Partial<TModel>|number|string) : TModel|undefined {
		if (value === undefined)
			return undefined;
		var result:TModel|undefined;
		switch (typeof(value)){
			case "string":
				return this.Select(this.Parent.BuildPartial(<string>value));
			case "number": 
				return this.Select(this.Parent.BuildPartial(<number>value));
			case "object":
				if (value instanceof Model)
					return this.Select(<any>value.Controller.Values.Current);

				var filters:any[] = [];
				var typeIndexes = this.Parent.Type.Attributes.Indexes;
				for (var typeIndexName in typeIndexes){
					var filter:any = {};
					typeIndexes[typeIndexName].forEach(typeIndex =>{						
						var index = typeIndex.Index;
						var property = typeIndex.Property;
						if (index.IsUnique)
							filter[property.Name] = property.GetValue(value);
					});
					filters.push(filter);
				}
				var keyProperty = this.Parent.Type.Attributes.PrimaryKey;
				if (keyProperty !== undefined){
					var filter:any = {};
					filter[keyProperty.Name] = keyProperty.GetValue(value);
					filters.push(filter)
				}

				filters.forEach(filter =>{
					var searchResults = this.Search(filter);
					if (searchResults.length == 1)
						return searchResults[0];
				});
				break;
		}
		return undefined;
	}
	public Search(value:Partial<TModel>|number|string):TModel[]{
		var result:TModel[] = [];
		switch (typeof(value)){
			case "string":
				return this.Search(this.Parent.BuildPartial(<string>value));
			case "number": 
				return this.Search(this.Parent.BuildPartial(<number>value));
			case "object":
				if (value instanceof Model)
					return this.Search(<any>value.Controller.Values.Current);
				
				var filter:any = value;
				result = this.Parent.Items.filter(item => {
					for(var key in filter){
						if (filter[key] === (<any>item.Controller.Values.Current)[key])
							return false;			
					}
					return true;
				});
				return result;
			default:
				return [];
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