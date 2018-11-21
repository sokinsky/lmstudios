import * as Schema from "./Schema";
import { Meta, Utilities } from "./";
import { API, ChangeTracker, Model, Repository, Request, Response, ResponseStatus} from './'
import * as Bridge from "./Bridge";

export enum ContextStatus { Ready, Initializing, Saving }
export class Context {
	constructor(api:string|API) {		
 		if (typeof(api) == "string")
			this.API = new API(this, api);
		else
			this.API = api;

		var proxy:Context = new Proxy(this, {
			set:(target, propertyName, propertyValue, reciever) =>{
				console.log(propertyName);
				return Reflect.set(target, propertyName, propertyValue, reciever);
			}
		})	

		this.Initialize();
		(<any>window).Context = proxy;
		return proxy;
	}
	public Schema:Schema.Context = new Schema.Context();
	public Status:ContextStatus = ContextStatus.Ready;
	public API:API;
	public ChangeTracker: ChangeTracker = new ChangeTracker(this);

	public NewGuid():Utilities.Guid{
		var guid = Utilities.Guid.Create();
		var exists = this.Select(guid);
		while (exists !== undefined){
			var guid = Utilities.Guid.Create();
			var exists = this.Select(guid);
		}
		return guid;
	}
	public Select(guid:Utilities.Guid|string):Model|undefined{
		if (typeof(guid) === "string")
			return this.Select(new Utilities.Guid(guid));
		var selectedEntry = this.ChangeTracker.Entries.find(entry => {
			var key = entry.Model.Controller.ID;
			return String(key) === String(guid.Value);
		});
		if (selectedEntry !== undefined)
			return selectedEntry.Model;
		return undefined;
	}


	public GetTypes():Meta.Type[]{
		return Meta.Type.GetTypes();
	}
	public GetType(type?:(new (...args: any[]) => any)):Meta.Type{
		if (type === undefined){
			var result = Meta.Type.GetType(this);
			if (result === undefined)
				throw new Error(`could not find repository of type(${type})`);
			return result;
		}
		else{
			var result =  Meta.Type.GetType(type);
			if (result === undefined)
				throw new Error(`could not find repository of type(${type})`);
			return result;
		}
	}

	public GetRepositories():Repository<Model>[]{
		var result:Repository<Model>[] = [];
		for (var key in this){
			if ((<any>this)[key] instanceof Repository){
				result.push((<any>this)[key]);
			}
		}
		return result;
	}
 	public GetRepository(type:(new (...args: any[]) => Model)|Meta.Type|string): Repository<Model>{
		 var result:Repository<Model>|undefined;
		 switch (typeof(type)){
			 case "function":
				 result = this.GetRepositories().find((x:Repository<Model>) => { return x.Type.Name === (<new (...args: any[]) => Model>type).name });
				 break;
			 case "object":
			 	result = this.GetRepositories().find((x:Repository<Model>) => { return x.Type === (<Meta.Type>type)});
				 break;
			 case "string":
				 result = this.GetRepositories().find((x:Repository<Model>) => { return x.Type.Name === <string>type});
				 break;
		 }
		 if (result === undefined)
		 	throw new Error(`could not find repository of type(${type})`);
		 return result;
	} 
	
	public async Initialize() {
		if (this.Status === ContextStatus.Initializing)
			return;

		let request = new Request("Context/Initialize", {});
		let response = await request.Post(this.API);
		this.Schema = new Schema.Context(response.Result.Schema);
		
		this.Schema.Models.forEach(model => {
			 
		});


		this.Load(response.Result.Models);
		this.Status = ContextStatus.Ready;
	}
	public async Load(models: any[]) {	
		console.log(models);
		let bridgeModels: Array<Bridge.Model> = [];
		if (Array.isArray(models)){
			models.forEach(item =>{
				bridgeModels.push(Bridge.Model.Create(item));
			})
		}
		bridgeModels.forEach((bridgeModel: Bridge.Model) => {	
			var dataModel = this.Select(bridgeModel.ID);
			if (dataModel === undefined){
				var repository = this.GetRepository(bridgeModel.Type);
				dataModel = repository.Add(bridgeModel.Value, true);
			}
			else{
				dataModel.Controller.Load(bridgeModel.Value, true);
			}			
			
		});
	}
	public async SaveChanges(): Promise<Response | undefined> {
		let bridgeModels: Bridge.Model[] = this.ChangeTracker.GetBridgeChanges();
		let request = new Request("Context/SaveChanges", bridgeModels);
		let response = await request.Post(this.API);
		if (response.Status == ResponseStatus.OK) {
			this.ChangeTracker.Clear();
			this.Load(response.Result);
		}			
		return response;
	}	
}

