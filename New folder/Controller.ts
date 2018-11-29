import { Guid } from "./Utilities";
import { Schema } from "./";
import { ChangeStatus, Context, Model, Request } from "./";

export class Controller<TModel extends Model> {
	public __internal:{
		id:string,
		context:Context,
		values:{
			actual:{
				model:TModel,
				data:Partial<TModel>
			},
			server:{
				data:Partial<TModel>
			},
			proxy:TModel,
			pending:Partial<TModel>
		}
	};
	constructor(context:Context, actual: TModel, proxy:TModel) {
		this.__internal = {
			id:Guid.Create().toString(),
			context:context,
			values:{
				actual:{
					model:actual,
					data:{}
				},
				server:{
					data:{}
				},
				proxy:proxy,
				pending:{}
			}
		}
	}

	public get Model():TModel{
		return this.__internal.values.actual.model;
	}
	public GetValue(property:Schema.Property|string):any{			
		if (typeof(property) === "string"){
			var actualProperty:Schema.Property|undefined = this.Model.GetType().GetProperty(<string>property);
			if (actualProperty !== undefined)
				return this.GetValue(actualProperty);
			return undefined;
		}
		return property.GetValue(this.Model);
	}
	public SetValue(property:Schema.Property|string, value:any, server?:boolean):any{
		if (typeof(property) === "string"){
			var actualProperty:Schema.Property|undefined = this.Model.GetType().GetProperty(property);
			if (actualProperty !== undefined)
				return this.SetValue(actualProperty, value, server);
		}
	}
	public GetChangeStatus(property?:Schema.Property|string):ChangeStatus{
		var dataModel:TModel|undefined = undefined;
		var dataRepository = this.__internal.context.GetRepository(this.Model.GetType());
		if (dataRepository !== undefined){
			dataModel = dataRepository.Items.find(model =>{
				return model
			})
		}
		var check = this.Repository.Items.find(x => {
			return x === this.Values.Proxy;
		});
		if (! check) {			
			if (this.Key.Value === undefined)
				return ChangeStatus.Added;
			else
				return ChangeStatus.Detached;
		}
		
		var modified = false;
		this.Type.GetProperties().forEach(property=>{
			var currentValue = property.GetValue(this.Values.Server.Data);
			var originalValue = property.GetValue(this.Values.Actual.Data);
			if (currentValue !== originalValue)
				modified = true;
		});
		if (modified) return ChangeStatus.Modified;
		else return ChangeStatus.Unchanged;
	}
	
	

	public Load(values: Partial<TModel>, server?:boolean) {
		for (var propertyName in values){
			var property:Schema.Property = this.Model.GetType().GetProperty(propertyName);
			if (property !== undefined)
			var value = property.GetValue(values);
			this.SetValue(property, value, server);				
		}
		this.Context.ChangeTracker.Add(this.Values.Proxy);
	}
	public Refresh(values?:Partial<TModel>){
		// if (values !== undefined)
		// 	this.Load(values);
		// var body = {
		// 	ID: this.ID,
		// 	Type: this.Type.Name,
		// 	Value: this.Values.Actual.Data
		// }
		// var request:Request = new Request("Model/Refresh", body);
		// var response = request.Post(this.Context.API).then(response=>{
		// 	this.Context.Load(response.Result);
		// })
	}

	public toString():string{
		var keyValue:string = this.ID;
		if (this.Key.Value !== undefined)
			 keyValue = this.Key.Value.toString();
		if (keyValue.length > 8)
			keyValue = `${keyValue.substring(0, 8)}...`
		return `${this.Type.Name}(${keyValue})`;
	}
}
