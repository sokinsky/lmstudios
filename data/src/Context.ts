import { Meta, Utilities } from "./";
import { API, ChangeTracker, Model, Repository, Request, Response, ResponseStatusType} from './'
import * as Bridge from "./Bridge";

export enum ContextStatus { Ready, Initializing, Saving }
export class Context {
	constructor(api:string|API) {
		(<any>window).Context = this;
 		if (typeof(api) == "string")
			this.API = new API(this, api);
		else
			this.API = api;

		var removeTypes:any[] = [];
		var types = Meta.Type.Types;
		types.forEach((type:Meta.Type)=>{
			var duplicates:Meta.Type[] = types.filter(x => {
				return type.Constructor === x.Constructor
			});
			let keep:Meta.Type|undefined = duplicates.find(x => {
				return x.Properties.length > 0
			});
			let replace:Meta.Type[] = duplicates.filter(x =>{
				return x.Properties.length <= 0;
			})
			if (keep !== undefined && replace.length > 0){
				var check = removeTypes.find(x =>{
					return x.keep === keep;
				})
				if (check === undefined)
					removeTypes.push({keep:keep, replace:replace});
			}
		});
		removeTypes.forEach(x =>{
			x.replace.forEach((y:any) => {
				var index = types.indexOf(y);
				types.splice(index, 1);
			});
		});
		types.forEach((type:Meta.Type)=>{
			type.Properties.forEach((property:Meta.Property)=>{
				var propertyType = Meta.Type.GetType(property.Type.Constructor);
				if (propertyType !== undefined)
					property.Type = propertyType;
			})
		});
		this.Initialize();
	}
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
			return String(entry.Model.Key.Guid.Value) === String(guid.Value);
		});
		if (selectedEntry !== undefined)
			return selectedEntry.Model;
		return undefined;
	}


	public GetTypes():Meta.Type[]{
		return Meta.Type.Types;
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
		this.Load(response);
		this.Status = ContextStatus.Ready;
	}
	public async Load(response: Response) {	
		let bridgeModels: Array<Bridge.Model> = [];
		if (Array.isArray(response.Result))
			bridgeModels = response.Result.map(x => new Bridge.Model(x));
		bridgeModels.forEach((bridgeModel: Bridge.Model) => {	
			var dataModel:Model|undefined = this.Select(bridgeModel.ID);
			if (dataModel === undefined){
				var repository = this.GetRepository(bridgeModel.Type);
				dataModel = repository.Add(bridgeModel.Value);
			}
			dataModel.Controller.Load(bridgeModel.Value);
		});
	}
	public async SaveChanges(): Promise<Response | undefined> {
		let bridgeModels: Bridge.Model[] = this.ChangeTracker.GetBridgeChanges();
		let request = new Request("Context/SaveChanges", bridgeModels);
		let response = await request.Post(this.API);
		if (response.Status.Type == ResponseStatusType.OK) {
			this.ChangeTracker.Clear();
			this.Load(response);
		}			
		return response;
	}	
}

