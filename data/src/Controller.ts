import { Guid } from "./Utilities";
import { Schema, Utilities } from "./";
import { Context, Model, Request, ServerStatus, ChangeStatus} from "./";
import { Repository } from "./Repository";
import { Collection } from "./Collection";




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
		console.log(property);

		if (typeof(property) === "string")
			return this.getValue_byPropertyName(<string>property);
		else if (property instanceof Schema.Property)
			return this.getValue_byProperty(<Schema.Property>property);
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
			referenceProperty.SetValue(selectFilter, property.GetValue(this.__values.Actual.Data));
		}		
		var repository = this.__context.GetRepository(property.Type);
		var result = repository.Local.Select(selectFilter);
		if (result === undefined){
			if (this.__status.Server.Properties[property.Name] === undefined){
				console.log(selectFilter);
				this.__status.Server.Properties[property.Name] = ServerStatus.Serving;
				result = await repository.Server.Select(selectFilter);
				this.__status.Server.Properties[property.Name] = ServerStatus.Served;
				this.SetValue(property, result, true);
			}
		}
		return result;
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
		
		if (property.Parent !== this.Model.GetType())
			throw new Error(`Controller.setValue_byProperty(property, value, fromServer):property's parent type(${property.Parent.Name}) is not the same as the controller's model type(${this.Model.GetType().Name})`);
		if (property.IsModel)
			this.setModel_byProperty(property, value, fromServer);
		else if (property.IsCollection)
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
		if (property.Type === undefined)
			throw new Error(`Contoller.setModel_byProperty(property, value, fromServer):property.Type is undefined.`);

		var referenceProperty = undefined;
		var referenceProperties = this.Model.GetType().Properties.filter(x => { return x.References !== undefined; });
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
			if (!(value instanceof Model))
				throw new Error(`Controller.setModel_byProperty(property, value, fromServer):value is not a Model`);
			if (value.GetType() !== property.Type)
				throw new Error(`Controller.setModel_byProperty(property, value, fromServer):property.Type(${property.Type.Name}) !== value.Type(${value.GetType().Name}).`);

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
		if (! property.IsCollection)
			throw new Error(`Controller.setCollection_byProperty():property IsCollection is false.`);
		if (! (value instanceof Collection))
			throw new Error(`Collection.setCollection_byProperty():value is not a collection`);
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
