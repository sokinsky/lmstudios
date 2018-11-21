import { Guid } from "./Utilities";
import { Meta } from "./";
import { ChangeStatus, Context, Model, Repository, Response, ResponseStatus, Request, SubRepository } from "./";
import * as Bridge from "./Bridge";

export class Controller<TModel extends Model> {
	constructor(actual: TModel, proxy:TModel) {
		this.Values = { 
			Actual:{
				Model:actual, 
				Data:{}
			}, 
			Server:{
				Time:undefined,
				Data:undefined
			},
			Proxy:proxy, 
			Pending:{} 
		}
	}
	public ID:string = Guid.Create().toString();
	public Values:{	
		Actual: {
			Model:TModel, 
			Data:Partial<TModel> 
		}, 
		Server: { 
			Time?:Date, 
			Data?:Partial<TModel> 
		}, 
		Proxy: TModel, 
		Pending:Partial<TModel> 
	};

	
	public get Context(): Context{
		return <Context>(<any>window)["Context"];
	}	
	public get Type():Meta.Type{
		return this.Values.Actual.Model.GetType();
	}
	public get Repository():Repository<TModel>{
		return <Repository<TModel>>this.Context.GetRepository(this.Type.Name);
	}

	public GetReferences(type:Meta.Type|Model, attr?:{optional?:boolean,required?:boolean}):Meta.Property[]{
		if (type instanceof Model)
			return this.GetReferences(type.GetType());
		var result = this.Values.Actual.Model.GetType().GetProperties().filter(property=>{
			return property.Type === type;
		});
		if (attr !== undefined){
			result = result.filter(property=>{
				var result = true;
				if (attr.optional !== undefined){
					if (attr.optional !== property.Attributes.Optional)
						result = false;
				}
				if (attr.required !== undefined){
					if (attr.required !== property.Attributes.Required)
						result = false;
				}
				return result;
			});
		}
		return result;
	}

	public get Key():{Property:Meta.Property, Value:string|number}{
		var property = this.Type.Key
		if (property === undefined)
			throw new Error(``);

		return {
			Property:property,
			Value:property.GetValue(this.Values.Actual.Model)
		};
	}
	public GetProperties(ofType?:Meta.Type):Meta.Property[]{
		var result = this.Type.GetProperties();
		if (ofType !== undefined){
			result = result.filter(property=>{
				return property.Type === ofType;
			})
		}
		return result;
	}
	public GetProperty(property:Meta.Property|string):Meta.Property{
		if (property instanceof Meta.Property)
			return property;
		if (typeof(property)==="string"){
			var result = this.Type.GetProperty(<string>property);
			if (result === undefined)
				throw new Error(`${this.Type.Name} does not have Property(${property})`);
			return result;
		}
		throw new Error(``);
			
	}
	public GetValue(property:Meta.Property|string):any{		
		property = this.GetProperty(property);

		var value = property.GetValue(this.Values.Actual.Model);
		if (value === undefined)
			return undefined;

		if (property.Type.IsSubTypeOf(Model)){
			if (value instanceof Model){		
				if (value.GetType() !== property.Type)
					value = undefined;
				if (value.Controller.Values.Server.Data === undefined){
					value.Refresh();
				}
										
			}
			else{
				var selectValue = this.Repository.Local.Select(value);
				if (selectValue === undefined){
					selectValue = this.Repository.Add(value);
					selectValue.Refresh();
				}
				value = selectValue;
			}
		}
		return value;
	}
	public SetValue(property:Meta.Property|string, value:any, server?:boolean){			
		property = this.GetProperty(property);
		if (property.Type.IsSubTypeOf(Model)){			
			if (value instanceof Model){
				if (value.GetType() !== property.Type)
					throw new Error(``);
				
				if (value !== property.GetValue(this.Values.Actual.Model)){			
					var keyValue = value.Controller.Key.Value;
					if (keyValue === undefined)
						keyValue = value.Controller.ID;

					property.SetValue(this.Values.Actual.Model, value);
					property.SetValue(this.Values.Actual.Data, keyValue);

					if (server){
						if (this.Values.Server.Data === undefined)
							this.Values.Server.Data = {};
						property.SetValue(this.Values.Server.Data, keyValue);						
					}
					var referenceProperties = value.Controller.GetReferences(this.Type)
					if (referenceProperties.length == 1){
						referenceProperties[0].SetValue(value, this.Values.Proxy)
					}
					this.Context.ChangeTracker.Add(this.Values.Proxy);
				}
			}
			else{
				var propertyRepository = this.Context.GetRepository(property.Type);	
				var local = propertyRepository.Local.Select(value);
				if (local === undefined)
					local = propertyRepository.Add(value, server);
				this.SetValue(property, local, server);			
			}
		}
		else if (property.Type.IsSubTypeOf(SubRepository)){
			if (value instanceof SubRepository){
				value.Name = property.Name;
				property.SetValue(this.Values.Actual.Model, value);
			}			
		}
		else {
			property.SetValue(this.Values.Actual.Model, value);
			property.SetValue(this.Values.Actual.Data, value);
			if (server)
				property.SetValue(this.Values.Server.Data, value);
			this.Context.ChangeTracker.Add(this.Values.Proxy);
		}
	}
	public GetChangeStatus():ChangeStatus{
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
		if (server)
			this.Values.Server = { Time:new Date, Data:{} };	
		for (var propertyName in values){
			var property = this.GetProperty(propertyName);
			var value = property.GetValue(values);
			this.SetValue(property, value, server);				
		}
		this.Context.ChangeTracker.Add(this.Values.Proxy);
	}
	public Refresh(values?:Partial<TModel>){
		if (values !== undefined)
			this.Load(values);
		var body = {
			ID: this.ID,
			Type: this.Type.Name,
			Value: this.Values.Actual.Data
		}
		var request:Request = new Request("Model/Refresh", body);
		var response = request.Post(this.Context.API).then(response=>{
			this.Context.Load(response.Result);
		})
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
