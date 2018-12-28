import * as LMS from "./";
import { ServerStatus } from "./ServerStatus";
import { ChangeStatus } from "./ChangeEntry";

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

	public GetValue(property:string|LMS.Schema.Property|undefined):any{	
		if (property === undefined)
			return undefined;
		if (typeof(property) === "string")
			return this.GetValue(this.Schema.GetProperty(property));
		if (property instanceof LMS.Schema.Property){
			if (property.PropertyType instanceof LMS.Schema.Model)
				return this.getModel(property);		
			return property.GetValue(this.Actual.Model);
		}
	}
	public async GetValueAsync(property:string|LMS.Schema.Property|undefined):Promise<any>{
		if (property === undefined)
			return undefined;
		if (typeof(property) === "string")
			return this.GetValueAsync(this.Schema.GetProperty(property));
		if (property instanceof LMS.Schema.Property){
			if (property.PropertyType instanceof LMS.Schema.Model)
				return this.getModelAsync(property);
			return property.GetValue(this.Actual.Model);
		}
	}
	private getModel(property:LMS.Schema.Property):LMS.Model|undefined{	
		var result = property.GetValue(this.Values.Actual.Model);
		if (result === undefined){	
			var repository = this.Context.GetRepository(property.PropertyType);
			result = repository.Local.Select(this.generateRelationshipFilter(property));
			if (result === undefined){
				if (this.Status.Server.Properties[property.Name] === undefined){
					this.getModelAsync(property).then((serverResult)=>{
						this.setModel(property, serverResult, true);
					})
				}	
			}	
			else{
				this.setModel(property, result);
			}	
		}
		return result;
	}
	private async getModelAsync(property:LMS.Schema.Property):Promise<LMS.Model|undefined>{
		var repository = this.Context.GetRepository(property.PropertyType);
		this.Status.Server.Properties[property.Name] = ServerStatus.Serving;
		var result = await repository.Server.Select(this.generateRelationshipFilter(property));
		this.setModel(property, result, true);
		this.Status.Server.Properties[property.Name] = ServerStatus.Served;
		return result;
	}

	public SetValue(property:string|LMS.Schema.Property|undefined, value:any, fromServer?:boolean){				
		if (property === undefined)
			return;

		if (typeof(property) === "string")
			this.SetValue(this.Schema.GetProperty(property), value, fromServer);

		if (property instanceof LMS.Schema.Property){
			if (property.PropertyType instanceof LMS.Schema.Model)
				this.setModel(property, value, fromServer);
			else{
				if (fromServer){
					property.SetValue(this.Values.Server.Data, value);
					this.Status.Server.Properties[property.Name] = ServerStatus.Served;
				}
				property.SetValue(this.Actual.Model, value);
				property.SetValue(this.Actual.Data, value);
				this.Status.Change.Properties[property.Name] = ChangeStatus.Unchanged;
				var serverValue = property.GetValue(this.Values.Server.Data);
				var actualValue = property.GetValue(this.Actual.Data);
				if (serverValue === undefined){
					if (actualValue !== undefined)
						this.Status.Change.Properties[property.Name] = ChangeStatus.Added;
				}
				else{
					if (actualValue === undefined)
						this.Status.Change.Properties[property.Name] = ChangeStatus.Deleted;
					else if (actualValue !== serverValue)
						this.Status.Change.Properties[property.Name] = ChangeStatus.Modified;
				}
				if (this.Status.Change.Model !== ChangeStatus.Added && this.Status.Change.Model !== ChangeStatus.Deleted){
					for (var key in this.Status.Change.Properties){
						if (this.Status.Change.Properties[key] !== ChangeStatus.Unchanged){
							this.Status.Change.Model = ChangeStatus.Modified;
							return;
						}							
					}
				}
			}				
		}
	}

	private setModel(property:LMS.Schema.Property, value:LMS.Model|Partial<LMS.Model>|undefined, fromServer?:boolean){
		var referenceProperty = this.getReferenceProperty(property);

		if (value instanceof LMS.Model){
			property.SetValue(this.Values.Actual.Model, value);
			var keyValue = value.PrimaryKey;
			if (keyValue === undefined)
				keyValue = value.__controller.ID;
			if (referenceProperty !== undefined){
				referenceProperty.SetValue(this.Values.Actual.Model, keyValue);
				referenceProperty.SetValue(this.Values.Actual.Data, keyValue);
			}				
			return;
		}
		else if (value === undefined){
			if (referenceProperty === this.Schema.PrimaryKeyProperty){			
				if (referenceProperty.Principal !== undefined){
					console.warn("Unable to delete or remove the principal Property reference");
					return;
				}
			}
			else{
				property.SetValue(this.Values.Actual.Model, value);
				if (referenceProperty !== undefined){
					referenceProperty.SetValue(this.Values.Actual.Model, value);
					referenceProperty.SetValue(this.Values.Actual.Data, value)
				}
			}
			return;
		}
		else{
			var repository = this.Context.GetRepository(property.PropertyType);
			
		}
		
	}
	private setCollection_byProperty(property:LMS.Schema.Property, value:LMS.Collection<LMS.Model>, fromServer?:boolean){
		property.SetValue(this.Actual.Model, value);
	}	

	public generateRelationshipFilter(property:LMS.Schema.Property):any {
		if (property.Relationship === undefined)
			return undefined;
		var result:any = {};
		for (let localName in property.Relationship){
			var localProperty = this.Values.Actual.Model.GetSchema().GetProperty(localName);
			if (localProperty !== undefined){
				var foreignProperty = property.Relationship[localName];
				foreignProperty.SetValue(result, localProperty.GetValue(this.Values.Actual.Model));
			}
		}
		return result;
	}
	public generateKeyFilter(key:LMS.Schema.Key):any{
		var result:any = {};
		for (let property of key.Properties){
			property.SetValue(result, property.GetValue(this.Values.Actual.Model));
		}
		return result;
	}
	public generateKeyFilters():any[]{
		var result:any[] = [];
		for (let key of this.Schema.Keys){
			result.push(this.generateKeyFilter(key));
		}
		return result;
	}
	public getReferenceProperty(property:LMS.Schema.Property):LMS.Schema.Property | undefined{
		if (property.Relationship !== undefined){
			for (var propertyName in property.Relationship){
				var referenceProperty = this.Schema.GetProperty(propertyName);
				if (referenceProperty !== undefined && referenceProperty.References !== undefined)
					if(referenceProperty.References.find(x => { return x === property}))
						return referenceProperty;
			}
		}
		return undefined;
	}

	public checkFilter(filter:any){
		for (var propertyName in filter){
			var property = this.Schema.GetProperty(propertyName);
			if (property !== undefined){
				if (property.GetValue(this.Values.Actual.Model) !== filter[propertyName])
					return false;
			}	
		}
		return true;
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
		if (this.PrimaryKey === undefined)
			return `${this.Schema.Name}(...)`;
		return `${this.Schema.Name}(${this.PrimaryKey})`
	}
}
