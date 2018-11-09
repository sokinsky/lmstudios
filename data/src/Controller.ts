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
	public Locked:boolean = false;
	public Values:{	Actual: {Model:TModel, Data:Partial<TModel> }, Server: { Time?:Date, Data?:Partial<TModel> }, Proxy: TModel, Pending:Partial<TModel> };

	
	public get Context(): Context {
		return this.Values.Actual.Model.Context;
	}
	public get Type():Meta.Type{
		return this.Values.Actual.Model.GetType();
	}
	public get Repository():Repository<TModel>{
		return <Repository<TModel>>this.Context.GetRepository(this.Type.Name);
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
	public GetValue(property:Meta.Property|string):any{		
		if (property === undefined)
			return undefined;
		if (typeof(property)==="string"){
			var findProperty = this.Type.GetProperty(<string>property);
			if (findProperty === undefined)
				throw new Error(`Type(${this.Type.Name}) does not have Property(${property})`);
			return this.GetValue(findProperty);
		}	
		var value = property.GetValue(this.Values.Actual.Model);

		if (value !== undefined){
			if (property.Type.IsSubTypeOf(Model)){
				if (value instanceof Model){		
					if (value.GetType() !== property.Type)
						value = undefined;
				}
				else{
					var selectValue = this.Repository.Local.Select(value);
					if (selectValue === undefined){
						selectValue = this.Repository.Add(value);
						this.Repository.Server.Select(value);
					}
					value = selectValue;
				}
			}
		}
		return value;
	}
	public SetValue(property:Meta.Property|string, value:any, server?:boolean){	
		if (property === undefined)
			return;
		if (typeof(property)==="string"){
			var findProperty = this.Type.GetProperty(<string>property);
			if (findProperty === undefined)
				throw new Error(`Type(${this.Type.Name}) does not have Property(${property})`);
			this.SetValue(findProperty, value);
			return;
		}

		if (property.Type.IsSubTypeOf(Model)){			
			if (value instanceof Model){
				if (value.GetType() !== property.Type)
					throw new Error(``);

				var referenceProperty = value.GetType().GetProperties().find(x => {
					if (x.Attributes.Required){
						if (x.Type === this.Type)
							return true;
					}
					return false;
				});
				if (referenceProperty !== undefined)
					referenceProperty.SetValue(value, this);

				property.SetValue(this.Values.Actual.Model, value);
				var keyValue = value.Controller.Key.Value;
				if (keyValue === undefined)
					keyValue = value.Controller.ID;
				property.SetValue(this.Values.Actual.Data, keyValue);
				if (server)
					property.SetValue(this.Values.Server.Data, keyValue);
				if (this.Locked)
					property.SetValue(this.Values.Pending, keyValue);
				this.Context.ChangeTracker.Add(this.Values.Proxy);
			}
			else{
				var propertyRepository = this.Context.GetRepository(property.Type);
				if (typeof(value)==="object"){
					console.log(`${propertyRepository.Type.Name}:${propertyRepository.Items.length}`)
					console.log(value);
					var local = propertyRepository.Local.Select(value);
					console.log(local);
					if (local === undefined){
						local = propertyRepository.Add(value);
						//local.Refresh(partial);
					}
					this.SetValue(property, local);
				}
				else{
					var partial = propertyRepository.BuildPartial(value);
					this.SetValue(property, partial);
				}
				
				value = propertyRepository.Local.Select(partial);
				if (partial !== undefined){
					value = this.GetValue(property);
					if (value === undefined)					
						value = propertyRepository.Add();				
					value.Load(partial);			
					this.SetValue(property, value, server);
				}			
			}
		}
		else if (property.Type.IsSubTypeOf(SubRepository)){
			console.error("fix this");
		}
		else {
			property.SetValue(this.Values.Actual.Model, value);
			property.SetValue(this.Values.Actual.Data, value);
			if (server)
				property.SetValue(this.Values.Server.Data, value);
			if (this.Locked)
				property.SetValue(this.Values.Pending, value);
			this.Context.ChangeTracker.Add(this.Values.Proxy);
		}
	}
	public GetChangeStatus():ChangeStatus{
		var check = this.Repository.Items.find(x => {
			return x === this.Values.Proxy;
		});
		if (! check) return ChangeStatus.Detached;
		if (this.Key.Value === undefined || this.Values.Server.Time === undefined)
			return ChangeStatus.Added;
		
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
			var property = this.Type.GetProperty(propertyName)
			if (property !== undefined){
				this.SetValue(property, property.GetValue(values), server);
			}			
		}
		this.Context.ChangeTracker.Add(this.Values.Proxy);
	}
	public Refresh(values?:Partial<TModel>){
		this.Locked = true;
		if (values !== undefined)
			this.Load(values);
		var body = {
			ID: this.ID,
			Type: this.Type.Name,
			Value: this.Values.Actual.Data
		}
		var request:Request = new Request("Model/Refersh", body);
		var response = request.Post(this.Context.API).then(response=>{
			this.Context.Load(response);
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
