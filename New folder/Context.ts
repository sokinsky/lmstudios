import * as Schema from "./Schema";
import { API, ChangeTracker, Model, Repository, Request, Response, ResponseStatus} from './'
import * as Bridge from "./Bridge";

export enum ContextStatus { None="None", Ready="Ready", Saving="Saving" }
export class Context {
	constructor() {	
		var decoration:{url:string} = ((<any>this).__proto__).context;
		if (decoration === undefined)
			throw new Error(`Please add @lmstudios.Decororators.Context to the context class`);
		if (decoration.url === undefined)
			throw new Error(`'url' was not added to the decorator`);
		this.API = new API(this, decoration.url);

		let request = new Request("Context/Initialize", {});
		request.Post(this.API).then(response => {
			if (response !== undefined){
				if (response.Request !== undefined){
					if (response.Result.Schema !== undefined){
						this.Schema = new Schema.Context(response.Result.Schema);
						this.Status = ContextStatus.Ready;
						if (response.Result.Models !== undefined){
							this.Load(response.Result.Models);
						}
					}
				}
			}
		});
	}
	public API:API;
	public Changes:ChangeTracker = new ChangeTracker(this);
	public Status:ContextStatus = ContextStatus.None;
	public Schema:Schema.Context|undefined;
	public get Repositories():Repository<Model>[]{
		var results:Repository<Model>[] = [];
		for (var key in this){
			if ((<any>this)[key] instanceof Repository){
				results.push((<any>this)[key]);
			}
		}
		return results;
	}
	public GetRepository(type:string|Schema.Type|(new (...args: any[]) => Model)):Repository<Model>|undefined {
		if (this.Status === undefined)
			return undefined;
		return undefined;
	}
	public async Load(...models: any[]) {	
		let bridgeModels: Array<Bridge.Model> = [];
		models.forEach(item =>{
			bridgeModels.push(Bridge.Model.Create(item));
		})
		bridgeModels.forEach((bridgeModel: Bridge.Model) => {
			var dataModel = undefined;
			var dataEntry = this.Changes.Entries.find(x => x.Model.__internal.controller.__internal.id == bridgeModel.ID);	
			if (dataEntry !== undefined)
				dataModel = dataEntry.Model;
			if (dataModel === undefined){
				var dataRepository = this.GetRepository(bridgeModel.Type);
				if (dataRepository !== undefined){
					dataModel = dataRepository.Local.Select(bridgeModel.Value);
					if (dataModel === undefined)
						dataModel = dataRepository.Add(bridgeModel.Value, true);
				}
				else{
					throw new Error(`Repository(${bridgeModel.Type}) is currently unavailable`);
				}				
			}
			dataModel.Load(bridgeModel.Value, true);					
			
		});
	}
	public async SaveChanges(): Promise<Response | undefined> {
		let bridgeModels: Bridge.Model[] = this.Changes.GetBridgeChanges();
		let request = new Request("Context/SaveChanges", bridgeModels);
		let response = await request.Post(this.API);
		if (response.Status == ResponseStatus.OK) {
			this.Changes.Clear();
			this.Load(response.Result);
		}			
		return response;
	}
}

