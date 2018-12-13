import { Guid } from "./Utilities";
import { Schema, Utilities } from "./";
import { Context, Model, Request } from "./";
import { Repository } from "./Repository";
import { Collection } from "./Collection";

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

	public get Model():TModel{
		return this.__values.Actual.Model;
	}



	public GetValue(property:Schema.Property|string):any{	
		if (typeof(property) === "string")
			return this.getValue_byPropertyName(<string>property);
		else if (property instanceof Schema.Property)
			return this.getValue_byProperty(<Schema.Property>property);
		else
			throw new Error(`Controller.GetValue(property):property is neither a string nor a Property`);
	}
	public SetValue(property:Schema.Property|string, value:any, fromServer?:boolean){		
		if (typeof(property) === "string")
			this.setValue_byPropertyName(<string>property, value, fromServer);
		else if (property instanceof Schema.Property)
			this.setValue_byProperty(<Schema.Property>property, value, fromServer);
		else
			throw new Error(`Controller.GetValue(property):property is neither a string nor a Property`);
	}

	private getValue_byProperty(property:Schema.Property):any{
		if (! (property instanceof Schema.Property))
			throw new Error(`Controller.getValue_byProperty(property):property is not an @lmstudios/data/Schema.Property`);
		if (property.Parent !== this.Model.GetType())
			throw new Error(`Controller.getValue_byProperty(property):property's parent type(${property.Parent.Name}) is not the same as the controller's model type(${this.Model.GetType().Name})`);
		if (property.IsModel)
			this.selectModel_byProperty(property);		
		else if (property.IsCollection)
			return property.GetValue(this.Model);
		else
			return property.GetValue(this.Model);
    }
	private getValue_byPropertyName(propertyName:string):any{
		if (typeof(propertyName) !== "string")
			throw new Error(`Controller.getValue_byPropertyName(propertyName):propertyName is not a string`);
		var property:Schema.Property|undefined = this.__values.Actual.Model.GetType().GetProperty(propertyName);
		if (property === undefined)
			throw new Error(`Controller.getValue_byPropertyName(propertyName):type(${this.Model.GetType().Name})propertyName(${propertyName})`);
		return this.getValue_byProperty(property);
	}
	private async selectModel_byProperty(property:Schema.Property):Promise<Model|undefined>{
		if (property.Type === undefined)
			throw new Error(`Controller.selectModel(property):property's Type is undefined`);
		if (property.Relationship === undefined)
			throw new Error(`Controller.selectModel(property):property's Relationship is undefined`);

		var selectFilter:any = {};
		for (var propertyName in property.Relationship){
			var referenceProperty = property.Relationship[propertyName];
			referenceProperty.SetValue(selectFilter, property.GetValue(this.Model));
		}		
		var repository = this.__context.GetRepository(property.Type);
		var result = await repository.Select(selectFilter);
		return result;
	}
	private setValue_byProperty(property:Schema.Property, value:any, fromServer?:boolean){
		if (property.Parent !== this.Model.GetType())
			throw new Error(`Controller.setValue_byProperty(property, value, fromServer):property's parent type(${property.Parent.Name}) is not the same as the controller's model type(${this.Model.GetType().Name})`);
		if (property.IsModel)
			this.setModel_byProperty(property, value, fromServer);
		else if (property.IsCollection)
			this.setCollection_byProperty(property, value, fromServer);
		else{
			switch (this.__status.Server.Properties[property.Name]){
				case ServerStatus.Serving:
					property.SetValue(this.__values.Pending, value);
					break;
				default:
					property.SetValue(this.__values.Actual.Model, value);
					property.SetValue(this.__values.Actual.Data, value);
			}
			if (fromServer)
				property.SetValue(this.__values.Server.Data, value);
		}
		var serverValue = property.GetValue(this.__values.Server.Data);
		var actualValue = property.GetValue(this.__values.Actual.Data);
		if (serverValue !== actualValue){
			if (serverValue === undefined){
				if (actualValue !== undefined)
					this.__status.Change.Properties[property.Name] = ChangeStatus.Added;
				else
					this.__status.Change.Properties[property.Name] = ChangeStatus.Modified;			
			}
			else {
				if (actualValue === undefined)
					this.__status.Change.Properties[property.Name] = ChangeStatus.Deleted;
				else
					this.__status.Change.Properties[property.Name] = ChangeStatus.Modified;
			}
		}
	}
	private setValue_byPropertyName(propertyName:string, value:any, fromServer?:boolean){
		if (typeof(propertyName) !== "string")
			throw new Error(`Controller.setValue_byPropertyName(propertyName, value, fromServer):propertyName is not a string`);
		var property:Schema.Property|undefined = this.__values.Actual.Model.GetType().GetProperty(propertyName);
		if (property === undefined)
			throw new Error(`Controller.setValue_byPropertyName(propertyName):type(${this.Model.GetType().Name})propertyName(${propertyName})`);
		return this.setValue_byProperty(property, value, fromServer);
	}
	private setModel_byProperty(property:Schema.Property, value:Model, fromServer?:boolean){
		if (! property.IsModel)
			throw new Error(`Controller.setModel_byProperty(property, value, fromServer):property.IsModel is false`);
		if (! (value instanceof Model))
			throw new Error(`Controller.setModel_byProperty(property, value, fromServer):value is not a Model`);
		if (property.Type === undefined)
			throw new Error(`Contoller.setModel_byProperty(property, value, fromServer):property.Type is undefined.`);
		if (value.GetType() !== property.Type)
			throw new Error(`Controller.setModel_byProperty(property, value, fromServer):property.Type(${property.Type.Name}) !== value.Type(${value.GetType().Name}).`);
		
		var referenceProperty = this.Model.GetType().LocalReferences(property);
		
	}
	private setCollection_byProperty(property:Schema.Property, value:Collection<Model>, fromServer?:boolean){
		if (! property.IsCollection)
			throw new Error(`Controller.setCollection_byProperty():property IsCollection is false.`);
		if (! (value instanceof Collection))
			throw new Error(`Collection.setCollection_byProperty():value is not a collection`);
		property.SetValue(this.Model, value);
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
		   if (value === undefined){
			   this.SetValue(property, undefined);
		   }
		   else if (property.Type !== undefined){
				var repository = this.__context.GetRepository(property.Type);
				var selectValue = repository.Local.Select(value);
				if (selectValue === undefined){
					selectValue = repository.Add(value);
					return this.SetModel(property, selectValue, server);
				}
		   }
		}
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

	public toString():string{
		var name = this.__schema.Name;
		name = this.__schema.Name.split('.')[this.__schema.Name.split('.').length -1];
		return `${name}(${this.PrimaryKey})`
	}
}
