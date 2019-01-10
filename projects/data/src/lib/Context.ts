// import * as LMS from "./";
// import { Repository } from "./Repository";
// export class Context {
// 	constructor(apiUrl:string, schemaData: any) {
// 		this.API = new LMS.API(this, apiUrl);
// 		this.Schema = new LMS.Schema.Context(schemaData);
// 		var proxy:Context = new Proxy(this, {
// 			set: (target, propertyName:string, propertyValue, reciever) => {
// 				if (propertyValue instanceof LMS.Repository){
// 					propertyValue.Name = propertyName;
// 					if (this.Repositories.find(x => { return x === propertyValue}) === undefined) {
// 						this.Repositories.push(propertyValue);
// 					}
						
// 				}					
// 				return Reflect.set(target, propertyName, propertyValue, reciever);
// 			}
// 		});
// 		this.Initialize();
// 		return proxy;
// 	}
// 	public API:LMS.API;
// 	public Tracker:LMS.ChangeTracker = new LMS.ChangeTracker(this);
// 	public Schema:LMS.Schema.Context;

// 	public Repositories:Repository<LMS.Model>[] = [];
// 	public async Initialize(){
// 		var request = new LMS.Request("Context/Initialize", {});
// 		var response = await this.API.Post(request);
// 		if (response !== undefined)
// 			this.Load(response.Result);
// 	}
// 	public GetRepository(type:string|LMS.Type|LMS.Model|(new (...args: any[]) => LMS.Model)):LMS.Repository<LMS.Model> {
// 		switch (typeof(type)){
// 			case "string":
// 				return this.getRepository_byName(<string>type);					
// 			case "object":
// 				if (type instanceof LMS.Model)
// 					return this.getRepository_byModel(type);
// 				else if (type instanceof LMS.Schema.Model )
// 					return this.getRepository_bySchema(type);
// 				break;
// 			case "function":
// 				var result = this.Repositories.find((repository:LMS.Repository<LMS.Model>) => { return type == repository.Schema.GetConstructor()});
// 				if (result !== undefined)
// 					return result;
// 				break;
// 		}
// 		throw new Error(``);
// 	}
// 	private getRepository_byName(name:string):LMS.Repository<LMS.Model>{
// 		var schemas = this.Schema.Models.filter(schema=>{return schema.FullName === name});
// 		switch(schemas.length){
// 			case 0: throw new Error(`Context.getRepository_byName():Unable to find schema(${name})`);
// 			case 1: return this.getRepository_bySchema(schemas[0]);
// 			default: throw new Error(`Context.getRepository_byName():Ambiguous schema name(${name})`);
// 		}
// 		var results = this.Repositories.filter(repository => { return repository.Schema.FullName === name});

// 	}
// 	private getRepository_bySchema(schema:LMS.Schema.Model){
// 		var results = this.Repositories.filter(repository => { 
// 			return repository.Schema.FullName === schema.FullName; });

// 		switch (results.length){
// 			case 0: throw new Error(`Context.getRepository_bySchema():Unable to locate repository(${schema.FullName})`);
// 			case 1: return results[0];
// 			default: throw new Error(`Context.getRepository_bySchema():Ambiguous repository(${schema.FullName})`);
// 		}
// 	}
// 	private getRepository_byModel(model:LMS.Model){
// 		var schema = model.GetSchema();
// 		if (schema === undefined)
// 			throw new Error(`Context.getRepository_byModel():Mode schema is undefined`);
// 		return this.getRepository_bySchema(schema);
// 	}
// 	private getRepository_byConstructor(constructor:(new (...args: any[]) => LMS.Model)){
// 		throw new Error(`Not implemented`);
// 	}
// 	public async Load(models: {ID:string,Type:string,Value:any}[], fromServer?:boolean) {	
// 		models.forEach((bridgeModel: any) => {
// 			var dataModel = undefined;
// 			var dataEntry = this.Tracker.Entries.find(x => x.Model.__controller.ID === bridgeModel.ID);
// 			if (dataEntry !== undefined)
// 				dataModel = dataEntry.Model;
// 			if (dataModel === undefined){
// 				var dataRepository = this.GetRepository(bridgeModel.Type);
// 				dataModel = dataRepository.Local.Select(bridgeModel.Value);
// 				if (dataModel === undefined)
// 					dataModel = dataRepository.Add(bridgeModel.Value, true);	
// 				else
// 					dataModel.Load(bridgeModel.Value, true);	
// 			}
// 			else{
// 				dataModel.Load(bridgeModel.Value, true);
// 			}							
// 		});
// 	}
// 	public async SaveChanges(): Promise<LMS.Response | undefined> {
// 		let bridgeModels: any[] = this.Tracker.GetBridgeChanges();
// 		let request = new LMS.Request("Context/SaveChanges", bridgeModels);
// 		let response = await request.Post(this.API);
// 		if (response.Status == LMS.ResponseStatus.OK) {
// 			this.Load(response.Result, true);
// 		}			
// 		return response;
// 	}
// }

