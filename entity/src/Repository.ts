import { Context, Controller, Model, Request, Response, ResponseStatus, ResponseStatusType, Utilities } from "./";
import * as Bridge from "./Bridge";

import { Meta } from "./";

export class Repository<TModel extends Model> {
	constructor(parent: Context | Model, type: (new (...args: any[]) => TModel)) {
		if (parent instanceof Model)
			this.Parent = parent;
		var checkType = Meta.Type.GetType(type);
		if (! checkType)
			throw new Error(`Repository Type(${type.name}) does not exist`)
		this.Type = checkType;
	}
	private __items:TModel[] = [];
	public get Items():TModel[]{
		if (this.Parent === undefined)
			return this.__items;
		
		var result = this.Local.Search();
		this.Server.Search();
		return result;
	}
	public *[Symbol.iterator]() {
		for (const value of this.Items) {
			yield value;
		}
	}
	public get Context(): Context{
		return <Context>(<any>window)["Context"];
	}
	public Parent?:Model;
	public get ParentFilter():any{
		var result:any = undefined;
		if (this.Parent !== undefined){
			var parentType = this.Parent.GetType();
			var parentProperties = this.Type.GetProperties().filter(x => {
				return x.Type === parentType;
			});			
			switch (parentProperties.length){
				case 0:
					throw new Error(`Type(${this.Type.Name}) does not have a property Type(${parentType.Name})`);
				case 1:
					result = { }
					result[parentProperties[0].Name] = this.Parent.Key.Value;
					break;
				default:
					throw new Error(`Type(${this.Type.Name}) contains multiple properties with type(${parentType.Name})`);
			}
		}
		return result;
	}
	private __customFilters:any[] = [];
	public get CustomFilters():any[]{
		return this.__customFilters
	}

	public filterItems(items:TModel[], filter:any){
		if (filter === undefined)
			return items;
		return items.filter((item:TModel)=>{
			var result:boolean = true;
			for (var key in filter){				
				var keyValue = filter[key];
				var itemValue = undefined;

				var property = this.Type.GetProperty(key);
				if (property !== undefined){
					if (property.Type !== undefined){
						itemValue = property.GetValue(item.Local);
						if (itemValue instanceof Model)
						if (property.Type.IsSubTypeOf(Model)){

							switch (typeof(keyValue)){
								case "number":
								case "string":
									if (property.GetValue(item.Local))
									break;
							}

						}
						else if (property.Type.IsSubTypeOf(Repository)){

						}
						else{
							switch (property.Type.Name){
								case "Date":
									break;
								case "String":
									break;
								case "Boolean":
									break;
								case "Number":
									break;
							}
						}
					}
					else {

					}

				}
			}

		}
		switch (typeof(value)){
			case "object":
				for (var key in value){
					var property = this.Parent.Type.GetProperty(key);
					if (property !== undefined){
						if (property.Type !== undefined){
							if (property.Type.IsSubTypeOf(Model)){
								if (value[key] === undefined)

							}
							else if (property.Type.IsSubTypeOf(Repository)){

							}
							else{
								switch (property.Type.Name){
									case "Date":
										break;
									case "Number":
										break;
									case "String":
										break;
								}
							}
						}
					}
				}
				break;
		}
	}

	public Type: Meta.Type;
    public Local: LocalRepository<TModel> = new LocalRepository(this);
	public Server: ServerRepository<TModel> = new ServerRepository(this);



	public Contains(item:TModel|Partial<TModel>):boolean{
		var existingItem:TModel|undefined;
		if (item instanceof Model){
			existingItem = this.Items.find(x => {
				return x===item;
			});
			if (existingItem)
				return true;
		}
		else{
			existingItem = this.Local.Select(item);
			if (existingItem)
				return true;
		}
		return false;
	}
	public Create(item:Partial<TModel>):TModel{
		var result = new this.Type.Constructor();
		(<TModel>result).Controller.Load(item);
		return result;
	}
	public Add(item:TModel|Partial<TModel>):TModel{
		if (! this.Contains(item)){
			if (item instanceof Model){
				if (item.GetType() !== this.Type)
					throw new Error(`Unable to add Type(${item.GetType().Name}) to Repository(${this.Type.Name})`);
				this.Items.push(item);
				this.Context.ChangeTracker.Add(item);
				return item;
			}
			else{
				return this.Add(this.Create(item));
			}				
		}
		return <TModel>item;
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

	public Initialize(){

	}
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
		var items = this.__items;
		if (this.Parent.Parent !== undefined){
			var parentFilter = {};
		}
		

		var results:TModel[] = 

		var type:Meta.Type = 
		return [];
	}
}
export class ServerRepository<TModel extends Model> {
    constructor(parent: Repository<TModel>) {
        this.Parent = parent;
    }
	public Parent: Repository<TModel>;
	public Initializing?: Date;
	public Initialized?: Date;

	public async Initialize() : Promise<TModel[]>{
		if (this.Parent.Parent !== undefined && this.Initialized !== undefined && this.Initializing != undefined){
			this.Initializing = new Date();
			var parentProperties = this.Parent.Type.GetProperties().filter(x => {
				return x.Type === this.Parent.Type;
			});
			var search:any;
			switch (parentProperties.length){
				case 0:
					throw new Error(`Type(${this.Parent.Type.Name}) does not have a property Type(${this.Parent.Parent.GetType().Name})`);
				case 1:
					search = { }
					search[parentProperties[0].Name] = this.Parent.Parent.Key.Value;
					break;
				default:
					throw new Error(`Type(${this.Parent.Type.Name}) contains multiple properties with type(${this.Parent.Parent.GetType().Name})`);
			}
			var result = this.Search(search);
			this.Initialized = new Date();
			return result;
		}
		return [];
	}
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
	public async Search(value: any){
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
	public async Refresh(){
		if (this)
	}
}