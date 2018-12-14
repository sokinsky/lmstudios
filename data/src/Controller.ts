import * as LMS from "./";

export class Controller<TModel extends LMS.Model> {
	constructor(context:LMS.Context, actual: TModel, proxy:TModel) {
		this.ID = LMS.Utilities.Guid.Create().toString();
		this.Context = context;
		this.Values = {
			Actual: { Model: actual, Data: {} },
			Server: { Data: {} },
			Pending: {},
			Proxy: proxy
		}
		this.Status = {
			Server: { Properties:{} },
			Change: { Properties:{} }
		}
	}
	public ID:string;
	public Context:LMS.Context;
	public Values:{
		Actual: { Model:TModel, Data:Partial<TModel> },
		Server: { Time?:Date, Data:Partial<TModel> },
		Pending: Partial<TModel>,
		Proxy: TModel
	}
	public get Actual(): { Model:TModel, Data:Partial<TModel> }{
		return this.Values.Actual;
	}
	public get Server(): { Time?:Date, Data:Partial<TModel> }{
		return this.Values.Server;
	}
	public get Pending(): Partial<TModel>{
		return this.Values.Pending;
	}
	public Status:{
		Server: { Model?:LMS.ServerStatus, Properties:{[name:string]:LMS.ServerStatus }},
		Change: { Model?:LMS.ChangeStatus, Properties:{[name:string]:LMS.ChangeStatus }}
	}
	public get Schema():LMS.Schema.Model{
		return this.Actual.Model.GetSchema();
	}
	public get PrimaryKey():any{
		var keyProperty = this.Schema.PrimaryKey
		return keyProperty.Properties[0].GetValue(this.Actual.Model);
	}

	public GetValue(property:LMS.Schema.Property|string):any{	
		if (typeof(property) === "string")
			return this.getValue_byPropertyName(<string>property);
		else if (property instanceof LMS.Schema.Property)
			return this.getValue_byProperty(<LMS.Schema.Property>property);
		else
			throw new Error(`Controller.GetValue(property):property is neither a string nor a Property`);
	}
	private getValue_byProperty(property:LMS.Schema.Property):any{
		if (property.PropertyType instanceof LMS.Schema.Model)
			return this.getModel_byProperty(property);		
		else if (property.PropertyType.Name === "Collection")
			return property.GetValue(this.Actual.Model);
		else
			return property.GetValue(this.Actual.Model);
    }
	private getValue_byPropertyName(propertyName:string):any{
		if (typeof(propertyName) !== "string")
			throw new Error(`Controller.getValue_byPropertyName():propertyName is not a string`);
		var property:LMS.Schema.Property|undefined = this.Schema.GetProperty(propertyName);
		if (property === undefined)
			throw new Error(`Controller.getValue_byPropertyName(propertyName):type(${this.Schema.FullName})propertyName(${propertyName})`);
		return this.getValue_byProperty(property);
	}
	private getModel_byProperty(property:LMS.Schema.Property):LMS.Model|undefined{
		var selectFilter:any = {};
		for (var propertyName in property.Relationship){
			var referenceProperty = property.Relationship[propertyName];
			referenceProperty.SetValue(selectFilter, property.GetValue(this.Actual.Data));
		}		
		var repository = this.Context.GetRepository(property.Model);
		var result = repository.Local.Select(selectFilter);
		return result;
	}
	private searchCollection_byProperty(property:LMS.Schema.Property):LMS.Model[]{
		return [];
	}

	public async GetValueAsync(property:LMS.Schema.Property|string):Promise<any>{
		if (typeof(property) === "string")
			return this.getValueAsync_byPropertyName(<string>property);
		else if (property instanceof LMS.Schema.Property)
			return this.getValueAsync_byProperty(<LMS.Schema.Property>property);
		else
			throw new Error(`Controller.GetValue(property):property is neither a string nor a Property`);
	}
	private async getValueAsync_byPropertyName(propertyName:string):Promise<any>{
		if (typeof(propertyName) !== "string")
			throw new Error(`Controller.getValueAsync_byPropertyName():propertyName is not a string`);
		var property:LMS.Schema.Property|undefined = this.Actual.Model.GetSchema().GetProperty(propertyName);
		if (property === undefined)
			throw new Error(`Controller.getValueAsync_byPropertyName():type(${this.Schema.FullName})propertyName(${propertyName})`);
		return this.getValue_byProperty(property);
	}
	private async getValueAsync_byProperty(property:LMS.Schema.Property):Promise<any>{
		console.log(property.PropertyType);
		if (property.PropertyType instanceof LMS.Schema.Model){
			console.log(property.PropertyType);
			this.getModelAsync_byProperty(property);
		}
					
		else if (property.PropertyType.Name == "Collection")
			return property.GetValue(this.Actual.Model);
		else
			return property.GetValue(this.Actual.Model);
	}

	private async getModelAsync_byProperty(property:LMS.Schema.Property):Promise<LMS.Model|undefined>{
		var selectFilter:any = {};
		for (var propertyName in property.Relationship){
			var referenceProperty = property.Relationship[propertyName];
			referenceProperty.SetValue(selectFilter, property.GetValue(this.Actual.Data));
		}		
		var repository = this.Context.GetRepository(property.Model);
		var result = repository.Local.Select(selectFilter);
		if (result === undefined){
			if (this.Status.Server.Properties[property.Name] === undefined){
				this.Status.Server.Properties[property.Name] = LMS.ServerStatus.Serving;
				result = await repository.Server.Select(selectFilter);
				this.Status.Server.Properties[property.Name] = LMS.ServerStatus.Served;
				this.SetValue(property, result, true);
			}
		}
		return result;
	}
	private async searchCollectionAsyn_byProperty(property:LMS.Schema.Property):Promise<LMS.Model[]>{
		return [];
	}

	public SetValue(property:LMS.Schema.Property|string, value:any, fromServer?:boolean){		
		if (typeof(property) === "string")
			this.setValue_byPropertyName(<string>property, value, fromServer);
		else if (property instanceof LMS.Schema.Property)
			this.setValue_byProperty(<LMS.Schema.Property>property, value, fromServer);
		else
			throw new Error(`Controller.GetValue(property):property is neither a string nor a Property`);
	}
	private setValue_byProperty(property:LMS.Schema.Property, value:any, fromServer?:boolean){		
		if (property.Model !== this.Schema)
			throw new Error(`Controller.setValue_byProperty(property, value, fromServer):property's parent type(${property.Model.FullName}) is not the same as the controller's model type(${this.Schema.FullName})`);
		if (property.PropertyType instanceof LMS.Schema.Model)
			this.setModel_byProperty(property, value, fromServer);
		else if (property.PropertyType.Name == "Collection")
			this.setCollection_byProperty(property, value, fromServer);
		else{
			property.SetValue(this.Actual.Model, value);
			property.SetValue(this.Actual.Data, value);
			switch (this.Status.Server.Properties[property.Name]){
				case LMS.ServerStatus.Serving:
					property.SetValue(this.Pending, value);
					break;
			}
			if (fromServer){
				this.Status.Server.Properties[property.Name] = LMS.ServerStatus.Served;
				property.SetValue(this.Server.Data, value);
			}
				
		}
		var serverValue = property.GetValue(this.Server.Data);
		var actualValue = property.GetValue(this.Actual.Data);

		if (serverValue !== actualValue){
			if (serverValue === undefined){
				if (actualValue !== undefined)
					this.Status.Change.Properties[property.Name] = LMS.ChangeStatus.Added;
				else
					this.Status.Change.Properties[property.Name] = LMS.ChangeStatus.Modified;			
			}
			else {
				if (actualValue === undefined)
					this.Status.Change.Properties[property.Name] = LMS.ChangeStatus.Deleted;
				else
					this.Status.Change.Properties[property.Name] = LMS.ChangeStatus.Modified;
			}
		}
		else{
			this.Status.Change.Properties[property.Name] = LMS.ChangeStatus.Unchanged;
		}
		if (this.Status.Change.Model !== LMS.ChangeStatus.Added && this.Status.Change.Model !== LMS.ChangeStatus.Deleted){
			var newStatus:LMS.ChangeStatus = LMS.ChangeStatus.Unchanged;
			for (var propertyName in this.Status.Change.Properties){
				if (this.Status.Change.Properties[propertyName] !== LMS.ChangeStatus.Unchanged){
					newStatus = LMS.ChangeStatus.Modified
					break;
				}					
			}
			this.Status.Change.Model = newStatus;
		}
	}
	private setValue_byPropertyName(propertyName:string, value:any, fromServer?:boolean){
		var property:LMS.Schema.Property|undefined = this.Schema.GetProperty(propertyName);
		if (property === undefined)
			throw new Error(`Controller.setValue_byPropertyName(propertyName):type(${this.Schema.FullName})propertyName(${propertyName})`);
		return this.setValue_byProperty(property, value, fromServer);
	}
	private setModel_byProperty(property:LMS.Schema.Property, value:LMS.Model, fromServer?:boolean){
		var referenceProperty = undefined;
		var referenceProperties = this.Schema.Properties.filter(x => { return x.References !== undefined; });
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
			property.SetValue(this.Actual.Model, value);
			property.SetValue(this.Actual.Data, value.__controller.PrimaryKey);
			switch (this.Status.Server.Properties[property.Name]){
				case LMS.ServerStatus.Serving:
					property.SetValue(this.Pending, value);
					break;
			}
			if (fromServer)
				property.SetValue(this.Server.Data, value);
		}



		
		
	}
	private setCollection_byProperty(property:LMS.Schema.Property, value:LMS.Collection<LMS.Model>, fromServer?:boolean){
		property.SetValue(this.Actual.Model, value);
	}	

	public Load(values: Partial<TModel>, fromServer?:boolean) {
		for (var propertyName in values){
			var property:LMS.Schema.Property|undefined = this.Schema.GetProperty(propertyName);
			if (property !== undefined){
				var value = property.GetValue(values);				
				this.SetValue(property, value, fromServer);	
			}			
		}
		if (fromServer)
			this.Status.Server.Model = LMS.ServerStatus.Served;		
	}

	public toString():string{
		return `${this.Schema.Name}(${this.PrimaryKey})`
	}
}
