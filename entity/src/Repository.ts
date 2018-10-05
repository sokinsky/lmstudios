import { Context, Controller, Model, Request, Response, ResponseStatus, ResponseStatusType, Application } from "./";
import * as Bridge from "./Bridge";

import { Meta } from "./";

export class RepositoryOwner {
	constructor(value:Context|Model, property?:Meta.Property){
		this.Value = value;
		this.Property = property;
	}
	public Value:Context|Model;
	public Property?:Meta.Property
}
export class Repository<TModel extends Model> {
	constructor(owner: Context | Model, type: (new (...args: any[]) => TModel)) {
		this.Owner = new RepositoryOwner(owner);
		var checkType = Meta.Type.GetType(type);
		if (! checkType)
			throw new Error(`Repository Type(${type.name}) does not exist`)
		this.Type = checkType;


		this.Local = new LocalRepository(this);
		this.Server = new ServerRepository(this);
	}

	public Owner:RepositoryOwner;
	public Type: Meta.Type;
	public get Application():Application{
		return <Application>(<any>window)["Application"];
	}
	public get Context(): Context{
		return <Context>(<any>window)["Context"];
	}

	public Items:TModel[] = [];
	public *[Symbol.iterator]() {
		for (const value of this.Items) {
			yield value;
		}
	}


	public Add(newItem:TModel|Partial<TModel>):TModel{
		var item:Model|undefined;
		if (!(newItem instanceof Model)){
			item = this.Local.Select(newItem);
			if (! item){
				item = new this.Type.Constructor();
				if (item)
					item.Controller.Load(newItem);
			}
		}
		else{
			item = newItem;
		}
		if (! item)
			throw Error("");

		if (item){
			var existingItem = this.Items.find(x =>{
				return x === item;
			});
			if (existingItem)
				return existingItem;
		}
		this.Items.push(<TModel>item);
		this.Context.ChangeTracker.Update(item);
		return <TModel>item;
	}

    public Local: LocalRepository<TModel>;
	public Server: ServerRepository<TModel>;

	public async Select(value: any): Promise<TModel | undefined> {
		var result = this.Local.Select(value);
		if (!result)
			result = await this.Server.Select(value);
		return result;
	}
}
export class LocalRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
    public Repository: Repository<TModel>;

    public Select(value:any) : TModel | undefined {
		var uniqueProperties:Meta.Property[] = this.Repository.Type.GetProperties({Unique:true});
		var keyProperties:Meta.Property[] = this.Repository.Type.GetProperties({Key:true});

		var result:TModel|undefined = undefined;
		switch (typeof(value)){
			case "object":
				if (uniqueProperties.length > 0){
					result = this.Repository.Items.find((item:Model) => {
						var check = false;
						uniqueProperties.forEach((property:Meta.Property) => {
							check = (<any>value)[property.Name] === (<any>item)[property.Name];
						});
						return check;
					});
					if (result)
						return result;
				}
				else if (keyProperties.length > 0){
					result = this.Repository.Items.find((item:Model) => {
						
						var check = false;
						keyProperties.forEach((property:Meta.Property) => {
							check = (<any>value)[property.Name] === (<any>item)[property.Name];
						});
						return check;
					})
					if (result)
						return result;
				}
				break;
			default:
				if (uniqueProperties.length == 1){
					result = this.Repository.Items.find((item:Model)=>{
						return uniqueProperties[0].GetValue(item) === value;
					});
					if (result)
						return result;
				}
				if (keyProperties.length == 1){
					result = this.Repository.Items.find((item:Model)=>{
						return keyProperties[0].GetValue(item.Sync) === value;
					})
					if (result)
						return result;
				}					

		}
		return result;
    }
}
export class ServerRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
    public Repository: Repository<TModel>;

	public async Select(value: any): Promise<TModel | undefined> {
		var body = {
			Type: this.Repository.Type.Name,
			Value: {}
		};
		if (value instanceof Model)
			body.Value = (<Model>value).Controller.Write();
		else
			body.Value = value;

		var request:Request = new Request("Model/Select", body);
		var response:Response = await request.Post(this.Repository.Context.API);
		
		if (response.Result)
			this.Repository.Context.Load(response);
        return this.Repository.Local.Select(value);
    }
}