import { Guid } from "./Utilities";
import { Schema, Utilities } from "./";
import { ChangeStatus, Context, Model, Request } from "./";
import { Repository } from "./Repository";

export class Controller<TModel extends Model> {
	constructor(context:Context, actual: TModel, proxy:TModel) {
		this.__context = context;
		this.__schema = actual.GetType();
		this.__repository = <Repository<TModel>>this.__context.GetRepository(actual);
		this.__values = {
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
	public __id:string = Utilities.Guid.Create().toString();
	public __context:Context;
	public __schema:Schema.Type;
	public __repository:Repository<TModel>;
	public __values:{ Actual:{ Model:TModel, Data:Partial<TModel>	}, Server:{	Data:Partial<TModel> },	Proxy:TModel, Pending:Partial<TModel> };
	

	public GetValue(property:Schema.Property|string):any{			
		if (typeof(property) === "string"){
			var actualProperty:Schema.Property|undefined = this.__values.Actual.Model.GetType().GetProperty(<string>property);
			if (actualProperty === undefined){
				console.warn(`Property(${property}) could not be found in Type(${this.__schema.Name})`);
				return undefined;
			}				
			else{
				return this.GetValue(actualProperty);
			}	
		}
		else if (property instanceof Schema.Property){
			return property.GetValue(this.__values.Actual.Model);
		}
		throw new Error(`Controller.GetValue():Invalid parameter`);
	}
	public SetValue(property:Schema.Property|string, value:any, server?:boolean):any{
		if (typeof(property) === "string"){
			var actualProperty:Schema.Property|undefined = this.__values.Actual.Model.GetType().GetProperty(<string>property);
			if (actualProperty === undefined){
				console.warn(`Property(${property}) could not be found in Type(${this.__schema.Name})`);
				return undefined;
			}				
			else{
				return this.SetValue(actualProperty, value, server);
			}	
		}
		else if (property instanceof Schema.Property){
			property.SetValue(this.__values.Actual.Data, value);
			property.SetValue(this.__values.Actual.Model, value);
			if (server)
				property.SetValue(this.__values.Server.Data, value);
			return true;
		}
		throw new Error(`Controller.SetValue():Invalid parameter`);
	}
	public GetChangeStatus(property?:Schema.Property|string):ChangeStatus{
		if (property!== undefined){
			if (typeof(property) === "string"){
				property = this.__schema.GetProperty(property);
				if (property !== undefined)
					return this.GetChangeStatus(property);
				else
					return ChangeStatus.Detached;
			}				
		}
		if (property !== undefined){
			if (property.Type !== this.__schema)
				return ChangeStatus.Detached;
			else {
				var actualValue = property.GetValue(this.__values.Actual.Data)
				var serverValue = property.GetValue(this.__values.Server.Data);
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
			var check = this.__repository.Items.find(model =>  { return this.__values.Actual.Model === model; } );
			if (check === undefined)
				return ChangeStatus.Detached;				
		}
		return ChangeStatus.Unchanged;
	}
	
	

	public Load(values: Partial<TModel>, server?:boolean) {
		for (var propertyName in values){
			var property:Schema.Property|undefined = this.__schema.GetProperty(propertyName);
			if (property !== undefined){
				var value = property.GetValue(values);				
				this.SetValue(property, value, server);	
			}			
		}
		console.log(this.__values);
	}
}
