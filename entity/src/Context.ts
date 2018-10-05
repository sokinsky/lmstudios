import { Meta } from "./";
import { API, Application, Model, Repository, Request, Response, ResponseStatusType} from './'
import * as Bridge from "./Bridge";

export enum ContextStatus { Ready, Initializing, Saving }
export class Context {
	constructor(api:string|API) {
		(<any>window).Context = this;
 		// var proxy: Context | undefined = new Proxy(this, {
		// 	get: (target, propertyName: string | number | symbol, reciever) => {
		// 		return Reflect.get(target, propertyName, reciever);
		// 	},
		// 	set: (target, propertyName: string | number | symbol, propertyValue, reciever) => {
		// 		if (propertyValue instanceof Repository)
		// 			(<any>propertyValue).Parent.Property = propertyName;
		// 		return Reflect.set(target, propertyName, propertyValue, reciever);

		// 	}
		// }); 
 		if (typeof(api) == "string")
			this.API = new API(this, api);
		else
			this.API = api;
		//this.Initialize();
		//return proxy;

		var types = Meta.Type.Types;
		types.forEach((type:Meta.Type)=>{
			type.Properties.forEach((property:Meta.Property)=>{
				if (property.Type){
					property.Type = Meta.Type.GetType(property.Type.Constructor)
				}
			})
		});
	}
	public Status:ContextStatus = ContextStatus.Ready;
	public API:API;
	public ChangeTracker: ChangeTracker = new ChangeTracker(this);

	public get Repositories():Array<Repository<Model>>{
		var result:Array<Repository<Model>> = [];
		for (var key in this){
			if ((<any>this)[key] instanceof Repository){
				result.push((<any>this)[key]);
			}
		}
		return result;
	}
 	public GetRepository(type: string): Repository<Model> {
		for (var key in this){
			if ((<any>this)[key] instanceof Repository){
				if ((<any>this)[key].Type.Name === type || (<any>this)[key].Type.FullName === type)
					return (<any>this)[key];
			}

		}
		throw new Error(`Unable to find repository with name(${type})`);
	} 
	public async Initialize() {
		if (this.Status === ContextStatus.Initializing)
			return;

		let request = new Request("Context/Initialize", {});
		let response = await request.Post(this.API);
		this.Load(response);
		this.Status = ContextStatus.Ready;
	}
	public async Load(response: Response) {	
		let bridgeModels: Array<Bridge.Model> = [];
		if (Array.isArray(response.Result))
			bridgeModels = response.Result.map(x => new Bridge.Model(x));
		bridgeModels.forEach((bridgeModel: Bridge.Model) => {			
			var dataModel: Model | undefined = this.GetRepository(bridgeModel.Type).Local.Select(bridgeModel.Value);
			if (!dataModel)
				dataModel = this.GetRepository(bridgeModel.Type).Add(bridgeModel.Value);
			else
				dataModel.Controller.Load(bridgeModel.Value);
		});
	}
	public async SaveChanges(): Promise<Response | undefined> {
		let bridgeModels: Array<Bridge.Model> = [];
		this.ChangeTracker.Entries.forEach((entry: Model) => {	
			var bridgeModel = new Bridge.Model({
				ID:entry.Controller.Guid.toString(),
				Type: entry.GetType().Name,
				Value: entry.Controller.Write()
			});
			bridgeModels.push(bridgeModel);			
		});
		let request = new Request("Context/SaveChanges", bridgeModels);
		let response = await request.Post(this.API);
		if (response.Status.Type == ResponseStatusType.OK) {
			this.ChangeTracker.Clear();
			this.Load(response);
		}			
		return response;
	}	
}
export class ChangeTracker {
	constructor(context: Context) {
		this.Context = context;
	}
	public Context: Context;
	public Entries : Model[] = []
	public Update(entry:Model){	
		console.log(entry);
		var original = JSON.stringify(entry.Controller.Values.Original);
		console.log(original);
		var current = JSON.stringify(entry.Controller.Write());
		console.log(current);
		var modified = (original != current);
		console.log(modified);


		if (modified)
			this.Add(entry);
	}
	public Add(entry: Model) {
		console.log(entry);
		var checkModel = this.Entries.find(x => {
			return x === entry
		});
		if (! checkModel)
			this.Entries.push(entry);
	}
	public Remove(entry: Model) {
		var index = this.Entries.indexOf(entry);
		if (index >= 0)
			this.Entries.splice(index, 1);
	}

	public Clear() {
		this.Entries = [];
	}
}
