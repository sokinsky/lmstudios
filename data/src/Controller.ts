import { Guid } from "./Utilities";
import { Schema, Utilities, Context, Model, ServerStatus, ChangeStatus, Repository, Collection } from "./";

export class Controller<TModel extends Model> {
	constructor(context:Context, actual: TModel, proxy:TModel) {
		this.__context = context;
		this.__schema = actual.GetSchema();
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
	public __schema:Schema.Model;
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
		var keyProperty = this.__values.Actual.Model.GetSchema().PrimaryKey
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
	private getValue_byProperty(property:Schema.Property):any{
		if (property.PropertyType instanceof Schema.Model)
			return this.getModel_byProperty(property);		
		else if (property.PropertyType.Name === "Collection")
			return property.GetValue(this.Model);
		else
			return property.GetValue(this.Model);
    }
	private getValue_byPropertyName(propertyName:string):any{
		if (typeof(propertyName) !== "string")
			throw new Error(`Controller.getValue_byPropertyName(propertyName):propertyName is not a string`);
		var property:Schema.Property|undefined = this.__values.Actual.Model.GetSchema().GetProperty(propertyName);
		if (property === undefined)
			throw new Error(`Controller.getValue_byPropertyName(propertyName):type(${this.Model.GetType().Name})propertyName(${propertyName})`);
		return this.getValue_byProperty(property);
	}
	private getModel_byProperty(property:Schema.Property):Model|undefined{
		var selectFilter:any = {};
		for (var propertyName in property.Relationship){
			var referenceProperty = property.Relationship[propertyName];
			referenceProperty.SetValue(selectFilter, property.GetValue(this.__values.Actual.Data));
		}		
		var repository = this.__context.GetRepository(property.Model);
		var result = repository.Local.Select(selectFilter);
		return result;
	}
	private searchCollection_byProperty(property:Schema.Property):Model[]{
		return [];
	}

	public async GetValueAsync(property:Schema.Property|string):Promise<any>{
		if (typeof(property) === "string")
			return this.getValueAsync_byPropertyName(<string>property);
		else if (property instanceof Schema.Property)
			return this.getValue_byProperty(<Schema.Property>property);
		else
			throw new Error(`Controller.GetValue(property):property is neither a string nor a Property`);
	}
	private async getValueAsync_byProperty(property:Schema.Property):Promise<any>{
		if (property.PropertyType instanceof Schema.Model)
			this.getModel_byProperty(property);		
		else if (property.PropertyType.Name == "Collection")
			return property.GetValue(this.Model);
		else
			return property.GetValue(this.Model);
	}
	private async getValueAsync_byPropertyName(propertyName:string):Promise<any>{
		if (typeof(propertyName) !== "string")
			throw new Error(`Controller.getValueAsync_byPropertyName():propertyName is not a string`);
		var property:Schema.Property|undefined = this.__values.Actual.Model.GetSchema().GetProperty(propertyName);
		if (property === undefined)
			throw new Error(`Controller.getValueAsync_byPropertyName():type(${this.Model.GetType().Name})propertyName(${propertyName})`);
		return this.getValue_byProperty(property);
	}
	private async selectModelAsync_byProperty(property:Schema.Property):Promise<Model|undefined>{
		var selectFilter:any = {};
		for (var propertyName in property.Relationship){
			var referenceProperty = property.Relationship[propertyName];
			referenceProperty.SetValue(selectFilter, property.GetValue(this.__values.Actual.Data));
		}		
		var repository = this.__context.GetRepository(property.Model);
		var result = repository.Local.Select(selectFilter);
		if (result === undefined){
			if (this.__status.Server.Properties[property.Name] === undefined){
				this.__status.Server.Properties[property.Name] = ServerStatus.Serving;
				result = await repository.Server.Select(selectFilter);
				this.__status.Server.Properties[property.Name] = ServerStatus.Served;
				this.SetValue(property, result, true);
			}
		}
		return result;
	}
	private async searchCollectionAsyn_byProperty(property:Schema.Property):Promise<Model[]>{
		return [];
	}

	public SetValue(property:Schema.Property|string, value:any, fromServer?:boolean){		
		if (typeof(property) === "string")
			this.setValue_byPropertyName(<string>property, value, fromServer);
		else if (property instanceof Schema.Property)
			this.setValue_byProperty(<Schema.Property>property, value, fromServer);
		else
			throw new Error(`Controller.GetValue(property):property is neither a string nor a Property`);
	}
	private setValue_byProperty(property:Schema.Property, value:any, fromServer?:boolean){		
		if (property.Model !== this.Model.GetType())
			throw new Error(`Controller.setValue_byProperty(property, value, fromServer):property's parent type(${property.Model.FullName}) is not the same as the controller's model type(${this.Model.GetType().Name})`);
		if (property.PropertyType instanceof Schema.Model)
			this.setModel_byProperty(property, value, fromServer);
		else if (property.PropertyType.Name == "Collection")
			this.setCollection_byProperty(property, value, fromServer);
		else{
			property.SetValue(this.__values.Actual.Model, value);
			property.SetValue(this.__values.Actual.Data, value);
			switch (this.__status.Server.Properties[property.Name]){
				case ServerStatus.Serving:
					property.SetValue(this.__values.Pending, value);
					break;
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
		else{
			this.__status.Change.Properties[property.Name] = ChangeStatus.Unchanged;
		}
		if (this.__status.Change.Model !== ChangeStatus.Added && this.__status.Change.Model !== ChangeStatus.Deleted){
			var newStatus:ChangeStatus = ChangeStatus.Unchanged;
			for (var propertyName in this.__status.Change.Properties){
				if (this.__status.Change.Properties[propertyName] !== ChangeStatus.Unchanged){
					newStatus = ChangeStatus.Modified
					break;
				}					
			}
			this.__status.Change.Model = newStatus;
		}
	}
	private setValue_byPropertyName(propertyName:string, value:any, fromServer?:boolean){
		var property:Schema.Property|undefined = this.__values.Actual.Model.GetSchema().GetProperty(propertyName);
		if (property === undefined)
			throw new Error(`Controller.setValue_byPropertyName(propertyName):type(${this.Model.GetType().Name})propertyName(${propertyName})`);
		return this.setValue_byProperty(property, value, fromServer);
	}
	private setModel_byProperty(property:Schema.Property, value:Model, fromServer?:boolean){
		var referenceProperty = undefined;
		var referenceProperties = this.Model.GetSchema().Properties.filter(x => { return x.References !== undefined; });
		referenceProperties = referenceProperties.filter(x => {
			return x.References !== undefined && x.References.find(y => {return y === property}) != undefined;
		});
		switch (referenceProperties.length){
			case 0:
				throw new Error(`Unknown Reference`);
			case 1:
				referenceProperty = referenceProperties[0];
				break;
			default:
				throw new Error(`Amibuous Reference`);
		}
		if (value === undefined){
		}
		else{
			property.SetValue(this.__values.Actual.Model, value);
			property.SetValue(this.__values.Actual.Data, value.__controller.PrimaryKey);
			switch (this.__status.Server.Properties[property.Name]){
				case ServerStatus.Serving:
					property.SetValue(this.__values.Pending, value);
					break;
			}
			if (fromServer)
				property.SetValue(this.__values.Server.Data, value);
		}



		
		
	}
	private setCollection_byProperty(property:Schema.Property, value:Collection<Model>, fromServer?:boolean){
		property.SetValue(this.Model, value);
	}	

	public Load(values: Partial<TModel>, fromServer?:boolean) {
		for (var propertyName in values){
			var property:Schema.Property|undefined = this.__schema.GetProperty(propertyName);
			if (property !== undefined){
				var value = property.GetValue(values);				
				this.SetValue(property, value, fromServer);	
			}			
		}
	}

	public toString():string{
		var name = this.__schema.Name;
		name = this.__schema.Name.split('.')[this.__schema.Name.split('.').length -1];
		return `${name}(${this.PrimaryKey})`
	}
}
