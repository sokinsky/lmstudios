import { Meta } from "./";
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
				if (property.Type)
					property.Type = Meta.Type.GetType(property.Type.Constructor);
			})
		});
		this.Initialize();


		// console.log(types);
		// removeTypes.forEach(x =>{
		// 	var index = types.indexOf(x);
		// 	types.splice(index, 1);
		// })
		// console.log(types);
	}
	public Status:ContextStatus = ContextStatus.Ready;
	public API:API;
	public ChangeTracker: ChangeTracker = new ChangeTracker(this);

	public Select(type:Meta.Type|string, value:any):Model|undefined{
		var repository = this.GetRepository(type);
		if (repository === undefined)
			throw new Error(`Not Repositorty with Type(${type}) was found`);
		return repository.Sync.Select(value);
	}

	public get Repositories():Array<Repository<Model>>{
		var result:Array<Repository<Model>> = [];
		for (var key in this){
			if ((<any>this)[key] instanceof Repository){
				result.push((<any>this)[key]);
			}
		}
		return result;
	}
 	public GetRepository(type:Meta.Type|string): Repository<Model>|undefined{
		 var typeName:string|undefined;
		 if (type instanceof Meta.Type)
			typeName = type.Name;
		else
			typeName = type;

		return this.Repositories.find(x => {
			return x.Type.Name === typeName;
		})
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
			var repository = this.GetRepository(bridgeModel.Type);
			if (repository !== undefined){
				var dataModel: Model | undefined = repository.Sync.Select(bridgeModel);
				if (!dataModel)
					dataModel = repository.Add(bridgeModel.Value);
				else
					dataModel.Controller.Load(bridgeModel.Value);
			}
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
	public GetType():Meta.Type{
		var result = Meta.Type.GetType(this);
		if (result)
			return result;
		throw new Error("");
	}
}

