import { Guid } from "./Utilities";
import { Schema, Utilities } from "./";
import { ChangeStatus, Context, Model, Request } from "./";
import { Repository } from "./Repository";

const internal=Symbol();

export class Controller<TModel extends Model> {
	[internal]:{
		context:Context
	};
	constructor(context:Context, actual: TModel, proxy:TModel) {
		this[internal] = {
			context:context
		}
		this.Values = {
			Actual:{
				Model:actual,
				Data:{}
			},
			Server:{
				Data:{}
			},
			Proxy:proxy,
			Pending:{}
		}
	}

	public ID:string = Utilities.Guid.Create.toString();
	public Values:{	Actual:{ Model:TModel, Data:Partial<TModel>	}, Server:{	Data:Partial<TModel> },	Proxy:TModel, Pending:Partial<TModel> };
	
	private __repository?:Repository<TModel>;
	public get Repository():Repository<TModel>{
		if (this.__repository === undefined){
			this.__repository = <Repository<TModel>>this[internal].context.GetRepository(this.Model);
			if (this.__repository === undefined)
				throw new Error(``);
		}
		return this.__repository;
	}

	public get Model():TModel{
		return this.Values.Actual.Model;
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
		if (property!== undefined){
			if (typeof(property) === "string"){
				property = this.Model.GetType().GetProperty(property);
				if (property !== undefined)
					return this.GetChangeStatus(property);
				else
					return ChangeStatus.Detached;
			}				
		}
		if (property !== undefined){
			if (property.Type !== this.Model.GetType())
				return ChangeStatus.Detached;
			else {
				var actualValue = property.GetValue(this.Values.Actual.Data)
				var serverValue = property.GetValue(this.Values.Server.Data);
				if (serverValue === actualValue)
					return ChangeStatus.Unchanged;
				else{
					if (serverValue === undefined)
						return ChangeStatus.Added;
					else if (actualValue === undefined)
						return ChangeStatus.Deleted;
					else
						return ChangeStatus.Modified;
				}				
			}			
		}
		else{
			var check = this.Repository.Items.find(model =>  { return this.Model === model; } );
			if (check === undefined)
				return ChangeStatus.Detached;				
		}
		return ChangeStatus.Unchanged;
	}
	
	

	public Load(values: Partial<TModel>, server?:boolean) {
		for (var propertyName in values){
			var property:Schema.Property|undefined = this.Model.GetType().GetProperty(propertyName);
			if (property !== undefined){
				var value = property.GetValue(values);
				this.SetValue(property, value, server);	
			}			
		}
	}
}
