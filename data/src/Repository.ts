import { Context, Controller, Model, Request, Response, ResponseStatus, ResponseStatusType, Utilities } from "./";
import * as Bridge from "./Bridge";

import { Meta } from "./";
import { Guid } from "./Utilities";

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
	public get KeyProperty():Meta.Property{
		var properties = this.Type.GetProperties({Key:true});
		switch (properties.length){
			case 1:
				return properties[0];
			case 0:
				throw  new Error(`Type(${this.Type.Name}) contains no key properties`);
			default:
				throw new Error(`Type(${this.Type.Name}) contains multiple key properties`);
		}
	}
	public get UniqueProperties():Meta.Property[]{
		return this.Type.GetProperties({Unique:true});
	}
	public get UniqueProperty():Meta.Property|undefined{
		var uniqueProperties = this.UniqueProperties;
		if (uniqueProperties.length === 1)
			return uniqueProperties[0];
		return undefined;
	}
    public Local: LocalRepository<TModel> = new LocalRepository(this);
	public Server: ServerRepository<TModel> = new ServerRepository(this);

	public Create(item:Partial<TModel>):TModel{
		var result = new this.Type.Constructor();
		(<TModel>result).Controller.Load(item);
		return result;
	}
	public Add(item:TModel|Partial<TModel>):TModel{
		var model:TModel;
		if (item instanceof Model)
			model = item;
		else
			model = this.Create(item);	
		if (model.Controller.Values.Unproxied === model)
			throw new Error(`Repository only excepts the proxied models`);
		var exists = this.Items.find(x => {
			return x === model;
		});
		if (! exists){
			this.__items.push(model);
		}	
		return model;		
	}

	public async Select(value: any):Promise<TModel|undefined> {
		var result:TModel|undefined = this.Local.Select(value);
		if (!result)
			result = await this.Server.Select(value);
		return result;
	}
	public async Search(...values:any[]):Promise<TModel[]>{
		await this.Server.Search(...values);
		return this.Local.Search(...values);
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
		var keyProperty = this.Parent.KeyProperty;
		var uniqueProperties = this.Parent.UniqueProperties;
		
		var result:TModel|undefined = undefined;
		switch (typeof(value)){
			case "object":
				var uniqueProperties = this.Parent.UniqueProperties;
				if (uniqueProperties.length > 0){
					result = this.Parent.Items.find(item => {
						var match:boolean = true;
						uniqueProperties.forEach(uniqueProperty=>{
							var itemValue = uniqueProperty.GetValue(item.Controller.Values.Unproxied);							
							var selectValue = uniqueProperty.GetValue(value);
							if (match === true)
								match = itemValue === selectValue;							
						})
						return match;
					})
				}
				if (result === undefined){
					result = this.Parent.Items.find(item =>{
						var itemValue = this.Parent.KeyProperty.GetValue(item.Controller.Values.Unproxied);
						var selectValue = this.Parent.KeyProperty.GetValue(value);
						return itemValue === selectValue;
					})
				}
				break;
			default:				
				result = this.Parent.Items.find(x => {
					var keyValue = String(keyProperty.GetValue(x.Controller.Values.Unproxied));
					return keyValue === String(value);
				})
				if (result === undefined && uniqueProperties.length == 1){
					result = this.Parent.Items.find(x => {
						var uniqueValue = String(uniqueProperties[0].GetValue(x.Controller.Values.Unproxied));
						return uniqueValue === String(value);
					})
				}
				break;
		}
		return result;
	}
	public Search(...values:any[]):TModel[]{
		return [];
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
	public async Search(...values:any[]):Promise<TModel[]>{
		for (var i=0; i<values.length; i++){
			var body = {
				Type: this.Parent.Type.Name,
				Value: values[i]
			}
			console.log(JSON.stringify(body));
			var request:Request = new Request("Model/Search", body);
			var response = await request.Post(this.Parent.Context.API);
			console.log(response);
			if (response !== undefined)
				this.Parent.Context.Load(response);
		}
		return this.Parent.Local.Search(...values);
	}
}