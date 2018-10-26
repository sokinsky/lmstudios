import { Context, Controller, Model, Request, Response, ResponseStatus, ResponseStatusType, Utilities } from "./";
import * as Bridge from "./Bridge";

import { Meta } from "./";

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

		var exists = this.Items.find(x => {
			return x === model;
		});
		if (! exists){
			this.__items.push(model);
			this.Context.ChangeTracker.Add(model);
		}
		return model;		
	}

	public async Select(value: any): Promise<TModel | undefined> {
		var result:TModel|undefined = this.Local.Select(value);
		if (!result)
			result = await this.Server.Select(value);
		return result;
	}
	public async Search(value:any):Promise<TModel[]> {
		await this.Server.Search(value);
		return this.Local.Search(value);
	}
}
export class LocalRepository<TModel extends Model> {
    constructor(parent: Repository<TModel>) {
        this.Parent = parent;
    }
    public Parent: Repository<TModel>;

    public Select(value:Bridge.Model|Partial<TModel>|number|string) : TModel | undefined {
		if (value instanceof Bridge.Model){
			var bridgeResult = this.Parent.Items.find(x => {
				return x.Controller.Guid.toString() === value.ID
			});
			if (bridgeResult !== undefined)
				return bridgeResult;
			return this.Select(value.Value);
		}
		var result:TModel|undefined;		
		var keyProperties:Meta.Property[] = this.Parent.Type.GetProperties({Key:true});
		switch (keyProperties.length){
			case 0:
				throw new Error("");
			case 1:
				var keyProperty = keyProperties[0];
				var keyValue:any = undefined;
				switch (typeof(value)){
					case "number":
					case "string":
						keyValue = value;
						if (keyValue !== undefined){
							result = this.Parent.Items.find(x =>{
								return String(keyProperty.GetValue(x.Controller.Model)) === String(keyValue);
							})
						}
						break;
					case "object":
						keyValue = keyProperty.GetValue(value);
						if (keyValue === undefined){
							result = undefined;
						}
						else {
							result = this.Parent.Items.find(x =>{
								return keyProperty.GetValue(x.Controller.Model) === keyValue;
							})
						}

						break;
				}
				break;
			default:
				throw new Error("");
		}
		return result;
	}
	public Search(...values:any[]):TModel[]{
		var items = this.Parent.Items.filter(x => {
			return true;
		})
		for (var i=0; i<values.length; i++){
			items = this.filterItems(items, values[i]);
		}
		return items;
	}
	public filterItems(items:TModel[], filter:any):TModel[]{
		if (filter === undefined)
			return items;
		return items.filter((item:TModel)=>{
			switch (typeof(filter)){
				default:
					return false;
				case "object":
					for (var filterKey in filter){
						var keyValue = filter[filterKey];
						var itemProperty = item.GetType().GetProperty(filterKey);
					}
					if (itemProperty !== undefined){
						var itemValue = itemProperty.GetValue(item.Local);
						if (itemProperty.Type !== undefined){
							if (itemProperty.Type.IsSubTypeOf(Model)){
								if (itemValue instanceof Model)
									itemValue = itemValue.Key.Value;
								if (keyValue instanceof Model)
									keyValue = keyValue.Key.Value;
							}
						}
						if (itemValue !== keyValue)
							return false;
					}
					return false;
			}
		});
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
	public async Search(value: any):Promise<TModel[]>{
		var body = {
			Type:this.Parent.Type.Name,
			Value: value
		};
		var request:Request = new Request("Model/Search", body);
		var response:Response = await request.Post(this.Parent.Context.API);
		if (response.Result)
			this.Parent.Context.Load(response);
		return this.Parent.Local.Search(value);
	}
}