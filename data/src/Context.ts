import * as Schema from "./Schema";
import { API, ChangeTracker, Model, Repository, Request, Response, ResponseStatus} from './'

export class Context {
	constructor(apiUrl:string, schemaData:any) {	
		this.API = new API(this, apiUrl);
		this.Schema = new Schema.Context(schemaData);
		var proxy:Context = new Proxy(this, {
			set: (target, propertyName:string, propertyValue, reciever) => {
				if (propertyValue instanceof Repository)
					propertyValue.Name = propertyName;
				return Reflect.set(target, propertyName, propertyValue, reciever);
			}
		});
		this.Initialize();
		return proxy;
	}
	public API:API;
	public Changes:ChangeTracker = new ChangeTracker(this);
	public Schema:Schema.Context;

	private __repositories?:Repository<Model>[];
	public get Repositories(){
		if (this.__repositories === undefined){
			this.__repositories = [];
			for (var key in this){
				if ((<any>this)[key] instanceof Repository){
					this.__repositories.push((<any>this)[key]);
				}
			}
		}
		return this.__repositories;
	}
	public async Initialize(){
		var request = new Request("Context/Initialize", {});
		var response = await this.API.Post(request);
		if (response !== undefined)
			this.Load(response.Result);
	}
	public GetRepository(type:string|Schema.Type|(new (...args: any[]) => Model)|Model):Repository<Model> {
		switch (typeof(type)){
			case "string":
				return this.GetRepository(this.GetType(<string>type));					
			case "object":
				if (type instanceof Model)
					return this.GetRepository(type.GetType());
				else if (type instanceof Schema.Type ){
					var result = this.Repositories.find((repository:Repository<Model>) => { return type === repository.Type });
					if (result !== undefined)
						return result;
				}
				break;
			case "function":
				var result = this.Repositories.find((repository:Repository<Model>) => { return type == repository.Type.Constructor});
				if (result !== undefined)
					return result;
				break;
		}
		throw new Error(``);
	}
	public async Load(models: {ID:string,Type:string,Value:any}[]) {	
		models.forEach((bridgeModel: any) => {
			var dataModel = undefined;
			var dataEntry = this.Changes.Entries.find(x => x.Model.ToBridge().ID === bridgeModel.ID);
			if (dataEntry !== undefined)
				dataModel = dataEntry.Model;
			if (dataModel === undefined){
				var dataRepository = this.GetRepository(bridgeModel.Type);
				dataModel = dataRepository.Local.Select(bridgeModel.Value);
				if (dataModel === undefined)
					dataModel = dataRepository.Add(bridgeModel.Value, true);	
				else
					dataModel.Load(bridgeModel.Value, true);	
			}
			else{
				dataModel.Load(bridgeModel.Value, true);
			}							
		});
	}
	public async SaveChanges(): Promise<Response | undefined> {
		let bridgeModels: any[] = this.Changes.GetBridgeChanges();
		console.log(bridgeModels);
		let request = new Request("Context/SaveChanges", bridgeModels);
		let response = await request.Post(this.API);
		if (response.Status == ResponseStatus.OK) {
			this.Changes.Clear();
			this.Load(response.Result);
		}			
		return response;
	}

	public GetType(name:string|(new (...args: any[]) => any)):Schema.Type{
		var result = this.Schema.GetType(name);
		if (result === undefined)
			throw new Error(``);
		return result;
	}
}

