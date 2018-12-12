import { Guid } from "./Utilities";
import { Schema, Utilities } from "./";
import { Context, Model, Request } from "./";
import { Repository } from "./Repository";

export enum ServerStatus { Serving = "Serving", Served = "Served" }
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
			Server: { Properties:{} },
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
		Server:{ Model?:ServerStatus, Properties:{[name:string]:ServerStatus} },
		Change:{ Model:ChangeStatus, Properties:{[name:string]:ChangeStatus} }
	}

	public get PrimaryKey():any{
		var keyProperty = this.__values.Actual.Model.GetType().PrimaryKey
		return keyProperty.Properties[0].GetValue(this.__values.Actual.Model);
	}


	public GetValue(property:Schema.Property|string):any{	
		if (property instanceof Schema.Property){
			if (property.Parent !== this.__values.Actual.Model.GetType())
				throw new Error(``);
			
			if (property.Relationship !== undefined) {
				var result = property.GetValue(this.__values.Actual.Model);
				if (result === undefined){
					if (property.Type !== undefined){	
						var value:any = {};
						for (var propertyName in property.Relationship){
							var localProperty = this.__values.Actual.Model.GetType().GetProperty(propertyName);
							if (localProperty){
								var foreignProperty = property.Relationship[propertyName];
								value[foreignProperty.Name] = localProperty.GetValue(this.__values.Actual.Model);
							}
						}
						var repository = this.__context.GetRepository(property.Type);
						repository.Select(value).then(model =>{
							this.SetValue(property, model);
						});
					}
					else{
						throw new Error(`Collections not implemented`);
					}
				}
				return result;
			}
			else {
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
		if (property instanceof Schema.Property) {
			if (property.IsModel){
				return this.SetModel(property, value, server);
			}
			else if (property.IsCollection){

			}	
			else{
				switch (this.__status.Server.Model){
					case ServerStatus.Serving:
						break;
					case ServerStatus.Served:
						break;
					default:
						switch (this.__status.Server.Properties[property.Name]){
							case ServerStatus.Serving:
								break;
							case ServerStatus.Served:
								break;
							default:
								property.SetValue(this.__values.Actual.Model, value);
								property.SetValue(this.__values.Actual.Data, value);							
								return true;
						}
						break;
				}
			}
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
	public SetModel(property:Schema.Property, value:Model|Partial<Model>, server?:boolean):boolean{
		if (value instanceof Model){
			if (property.Type !== undefined && property.Type == value.GetType()){	
			   var foreignKey = value.__controller.PrimaryKey;
			   if (foreignKey === undefined)
				   foreignKey = value.__controller.__id;
				switch (this.__status.Server.Model){
					case ServerStatus.Serving:
						break;
					case ServerStatus.Served:
						break;
					default:
						switch (this.__status.Server.Properties[property.Name]){
							case ServerStatus.Serving:
								break;
							case ServerStatus.Served:
								break;
							default:
							property.SetValue(this.__values.Actual.Model, value);
							property.SetValue(this.__values.Actual.Data, foreignKey);							
							if (server)
								property.SetValue(this.__values.Server.Data, foreignKey);
						}
						break;
				}	
				if (property.Type.PrimaryKey.Properties[0].References !== undefined){
					var foreignReference = property.Type.PrimaryKey.Properties[0].References.find(r => { return r.Type === this.__schema});
					if (foreignReference !== undefined){
						if (foreignReference.GetValue(value.__controller.__values.Actual.Model) !== this.__values.Actual.Model){
							value.SetValue(foreignReference, this.__values.Actual.Model);
						}
					}
				}									
		   }
		   
	   }
	   else {
		   if (property.Type !== undefined){
				var repository = this.__context.GetRepository(property.Type);
				var selectValue = repository.Local.Select(value);
				if (selectValue === undefined){
					selectValue = repository.Add(value);
					return this.SetModel(property, selectValue, server);
				}
		   }
		}
		console.log(this.__values.Actual.Model);
		return true;
	}
	public GetChangeStatus(property?:Schema.Property|string):ChangeStatus{
		if (property !== undefined ){
			if (typeof(property) === "string"){
				property = this.__schema.GetProperty(property);
				if (property !== undefined)
					return this.GetChangeStatus(property);
			}				
		}
		else {
  			if (this.PrimaryKey === undefined){				
				return ChangeStatus.Added;
			}
			var properties = this.__values.Actual.Model.GetType().Properties;
			for (var p of properties){

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
