import * as Schema from "./Schema";
import { API, ChangeTracker, Model, Repository, Request, Response, ResponseStatus} from './'


export enum ContextStatus { None="None", Ready="Ready", Saving="Saving" }
export class Context {
	constructor(schema:Schema.Context) {	
		var decoration:{name:string, url:string} = ((<any>this).__proto__).context;
		if (decoration === undefined)
			throw new Error(`Please add @lmstudios.Decororators.Context to the context class`);
		if (decoration.url === undefined)
			throw new Error(`'url' was not added to the decorator`);
		this.API = new API(this, decoration.url);
		this.Schema = schema;

		let request = new Request("Context/Initialize", {});
		request.Post(this.API).then(response => {
			if (response !== undefined){
				if (response.Request !== undefined){
					if (response.Result.Schema !== undefined){
						this.Schema = new Schema.Context(response.Result.Schema);
						this.Initialized = true;					
						for (const repository of this.Repositories){
							console.log(repository.__internal.type.constructor.prototype);
						}
						this.Status = ContextStatus.Ready;
						if (response.Result.Models !== undefined){
							this.Load(response.Result.Models);
						}
					}
				}
			}
		});
	}
	public Initialized:boolean = false;
	public API:API;
	public Changes:ChangeTracker = new ChangeTracker(this);
	public Status:ContextStatus = ContextStatus.None;
	public Schema:Schema.Context|undefined;

	public get Repositories(){
		return this.getRepositories();
	}
	public * getRepositories(){
		for (var key in this){
			if ((<any>this)[key] instanceof Repository){
				yield (<any>this)[key];
			}
		}
	}

	public GetRepository(type:string|Schema.Type|(new (...args: any[]) => Model)|Model):Repository<Model>|undefined {
		if (this.Status === undefined)
			return undefined;
		switch (typeof(type)){
			case "string":
				if (this.Schema !== undefined){
					var schemaType = this.Schema.Types.find(x => x.Name === type);
					if (schemaType !== undefined)
						return this.GetRepository(schemaType);					
				}
				return undefined;
			case "object":
				if (type instanceof Model)
					return this.GetRepository(type.GetType());
				else if (type instanceof Schema.Type && type.Constructor !== undefined)
					return this.Repositories.find(repositorty => { return repositorty.__internal.type.schema === type});
				return undefined;
			default:
				return this.Repositories.find(repositorty => { return repositorty.__internal.type.constructor === type});
				
		}
		return undefined;
	}
	public async Load(models: {ID:string,Type:string,Value:any}[]) {	
		models.forEach((bridgeModel: any) => {
			var dataModel = undefined;
			var dataEntry = this.Changes.Entries.find(x => x.Model.ToBridge().ID === bridgeModel.ID);
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
		let bridgeModels: any[] = this.Changes.GetBridgeChanges();
		let request = new Request("Context/SaveChanges", bridgeModels);
		let response = await request.Post(this.API);
		if (response.Status == ResponseStatus.OK) {
			this.Changes.Clear();
			this.Load(response.Result);
		}			
		return response;
	}

	public GetType(name:string|(new (...args: any[]) => any)):Schema.Type|undefined{
		if (this.Schema !== undefined)
			return this.Schema.GetType(name);
		return undefined;
	}
}

