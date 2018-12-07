import { Guid } from "./Utilities";
import { Schema, Utilities } from "./";
import { Context, Model, Request } from "./";
import { Repository } from "./Repository";

export enum ServerStatus { None = "None", Serving = "Serving", Served = "Served" }
export enum ChangeStatus { Unchanged = "Unchanged", Modified = "Modified", Added = "Added", Deleted = "Deleted" }

export class Controller<TModel extends Model> {
	constructor(context:Context, actual: TModel, proxy:TModel) {
		this.__context = context;
		this.__schema = actual.GetType();
		this.__repository = <Repository<TModel>>this.__context.GetRepository(actual);
		this.__values = {
			Actual:{ Model:actual, Data:{} },
			Server:{ Data:{} },
			Proxy:proxy,
			Pending:{}
		}	
		this.__status = {
			Server: { Model:ServerStatus.None, Properties:{} },
			Change: { Model:ChangeStatus.Unchanged,	Properties:{} }
		}	
	}
	public __id:string = Utilities.Guid.Create().toString();
	public __context:Context;
	public __schema:Schema.Type;
	public __repository:Repository<TModel>;
	public __values:{ 
		Actual:{ Model:TModel, Data:Partial<TModel>	}, 
		Server:{	Data:Partial<TModel> },	
		Proxy:TModel, 
		Pending:Partial<TModel> 
	};
	public __status: {
		Server:{ Model:ServerStatus, Properties:{[name:string]:ServerStatus} },
		Change:{ Model:ChangeStatus, Properties:{[name:string]:ChangeStatus} }
	}


	public GetValue(property:Schema.Property|string):any{	
		if (property instanceof Schema.Property){
			
			if (property.References.length > 0){
				console.log(property);
				for (var reference of property.References){
					switch (reference.Type){
						case Schema.ReferenceType.Key:
							break;
						case Schema.ReferenceType.Model:
							console.log(reference);
							if (reference.Relationship.Type === property.Type){
								var filter:any = {};
								for (var propertyName in reference.Relationship.Properties){
									var parentProperty = this.__schema.GetProperty(propertyName);
									if (parentProperty === undefined)
										throw new Error(``);
									var childProperty = reference.Relationship.Properties[propertyName];
									filter[childProperty.Name] = parentProperty.GetValue(this.__values.Actual.Model);
								}
								console.log(filter);
							}
							break;
						case Schema.ReferenceType.Collection:
							break;
					}
				}
				return undefined;
			}
			else{				
				console.log(property);
				return property.GetValue(this.__values.Actual.Model);
			}
		}		
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

		throw new Error(`Controller.GetValue(${property}):Invalid parameter`);
	}
	public SetValue(property:Schema.Property|string, value:any, server?:boolean):boolean{
		if (property instanceof Schema.Property){
			property.SetValue(this.__values.Actual.Model, value);
			property.SetValue(this.__values.Actual.Data, value);
			if (server !== undefined)
				property.SetValue(this.__values.Server.Data, value);
			return true;
		}
		if (typeof(property) === "string"){
			var actualProperty:Schema.Property|undefined = this.__values.Actual.Model.GetType().GetProperty(<string>property);
			if (actualProperty !== undefined)
				return this.SetValue(actualProperty, value, server);
			console.warn(`Property(${property}) could not be found in Type(${this.__schema.Name})`);
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
			}				
		}
		if (property !== undefined){
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
		else{
			
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
	}
}
