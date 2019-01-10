// import * as LMS from "./";
// import { ChangeStatus } from "./ChangeEntry";
// export class Repository<TModel extends LMS.Model> {
// 	constructor(context:LMS.Context, model: (new (...args: any[]) => TModel)) {
// 		var fullName = ((<any>model).prototype).model.FullName;

// 		this.Context = context;
// 		var schema = this.Context.Schema.Models.find(x => { return x.FullName === fullName});
// 		if (schema === undefined)
// 			throw new Error(``);
// 		var type = LMS.Type.GetType(fullName);
// 		if (type === undefined)
// 			throw new Error(``);
// 		this.Schema = schema;
// 	}
// 	private __items:TModel[] = [];
// 	public get Items():TModel[]{
// 		return this.__items;
// 	}
// 	public *[Symbol.iterator]() {
// 		for (const value of this.Items) {
// 			yield value;
// 		}
// 	}
// 	public Context:LMS.Context;
// 	public Name:string = "";
// 	public Schema:LMS.Schema.Model;

//     public Local: LocalRepository<TModel> = new LocalRepository(this);
// 	public Server: ServerRepository<TModel> = new ServerRepository(this);

// 	public Create():TModel{
// 		var constructor = this.Schema.GetConstructor();
// 		if (constructor !== undefined){
// 			var result = new constructor(this.Context);
// 			return result;
// 		}
// 		throw new Error(`Repository.Create was unable to create Model`);
// 	}
// 	public Add(value?:TModel|Partial<TModel>, fromServer?:boolean):TModel{			
// 		if (value === undefined)
// 			value = this.Add({});
		
// 		var result:TModel|undefined = undefined;	
// 		if (! (value instanceof LMS.Model)){			
// 			result = this.Local.Select(value);
// 			if (result === undefined){				
// 				result = this.Create();				
// 				result.Load(value, fromServer);
// 				return this.Add(result, fromServer);
// 			}	
// 			return result;
// 		}
// 		if (value instanceof LMS.Model){
// 			if (value.GetSchema() !== this.Schema)
// 				throw new Error(`Repository.Add():Model(${value.GetSchema().FullName}) is not valid in Repository<${this.Schema.FullName}>`);
// 			var exists = this.Items.find(x => { return x === value});
// 			if (exists === undefined){
// 				this.Items.push(value);
// 				if (value.__controller.Status.Change.Model === ChangeStatus.Detached)
// 					value.__controller.Status.Change.Model = ChangeStatus.Added;
				
// 			}
			
// 			if (fromServer === true)
// 				value.__controller.Status.Change.Model = LMS.ChangeStatus.Unchanged;
// 			else
// 				value.__controller.Status.Change.Model = LMS.ChangeStatus.Added;
// 			return value;
// 		}	
// 		throw Error(``);
// 	}
// 	public Remove(value:TModel){		
// 		var index = this.Items.indexOf(value);
// 		if (index >= 0)
// 			this.Items.splice(index, 1);
// 	}

// 	public async Select(value:Partial<TModel>):Promise<TModel|undefined> {
// 		var result = this.Local.Select(value);
// 		if (!result)
// 			result = await this.Server.Select(value);
// 		return result;
// 	}
// 	public async Search(...values:any[]):Promise<TModel[]>{
// 		if (values === undefined || values.length === 0)
// 			return [];
// 		if (values.length === 1 && Array.isArray(values[0]))
// 			values = values[0];

// 		await this.Server.Search(...values);
// 		return this.Local.Search(...values);
// 	}
// }
// export class LocalRepository<TModel extends LMS.Model> {
//     constructor(repository: Repository<TModel>) {
//         this.Repository = repository;
//     }
// 	public Repository: Repository<TModel>;
// 	public get Items():TModel[]{
// 		return this.Repository.Items;
// 	}
// 	public get Schema():LMS.Schema.Model{
// 		return this.Repository.Schema;
// 	}


//     public Select(value:Partial<TModel>) : TModel|undefined {				
// 		var filter:Partial<TModel> = {};
// 		if (this.Schema.PrimaryKey.Properties.length === 1){
// 			var keyValue = this.Schema.PrimaryKey.Properties[0].GetValue(value);
// 			if (keyValue !== undefined){
// 				this.Schema.PrimaryKey.Properties[0].SetValue(filter, keyValue);
// 				var results = this.Search(filter);		
// 				if (results.length === 1)
// 					return results[0];
// 			}				
// 		}	
// 		this.Schema.AdditionalKeys.forEach(key =>{
// 			filter = {};
// 			key.Properties.forEach(property=>{
// 				property.SetValue(filter, property.GetValue(value));
// 			})
// 			results = this.Search(filter);
// 			if (results.length === 1)
// 				return results[0];
// 		});
// 		return undefined;
// 	}
// 	public Search(...values:any[]):TModel[]{
// 		var results:TModel[] = [];
// 		for (let value of values){
// 			for (let item of this.Repository.Items){
// 				var include = true;
// 				for (var propertyName in value){
// 					var property = this.Schema.GetProperty(propertyName);
// 					if (property !== undefined){
// 						if (property.GetValue(item) !== property.GetValue(value))
// 							include = false;
// 					}	
// 				}
// 				if (include){
// 					var included = results.find(x => { return (x === item); });
// 					if (!included)
// 						results.push(item);									
// 				}	
// 			}			
// 		}
// 		return results;
// 	}
// }
// export class ServerRepository<TModel extends LMS.Model> {
//     constructor(repository: Repository<TModel>) {
//         this.Repository = repository;
//     }
// 	public Repository: Repository<TModel>;
// 	public get Schema():LMS.Schema.Model{
// 		return this.Repository.Schema;
// 	}
// 	public async Select(value: Partial<TModel>) : Promise<TModel|undefined> {
// 		var body = {
// 			Type: this.Schema.FullName,
// 			Value: value
// 		};
// 		var request:LMS.Request = new LMS.Request("Model/Select", body);
// 		var response:LMS.Response = await request.Post(this.Repository.Context.API);
// 		if (response.Result)
// 			this.Repository.Context.Load(response.Result);
// 		return this.Repository.Local.Select(value);
// 	}
// 	public async Search(...values:any[]):Promise<TModel[]>{
// 		var body = {
// 			Type:this.Schema.FullName,
// 			Values:values
// 		}
// 		var request:LMS.Request = new LMS.Request("Model/Search", body);
// 		var response = await request.Post(this.Repository.Context.API);
// 		if (response !== undefined)
// 			this.Repository.Context.Load(response.Result);
// 		return this.Repository.Local.Search(...values);
// 	}
// }