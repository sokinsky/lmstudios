import { Guid } from "./Utilities";
import { Meta } from "./";
import { ChangeStatus, Context, Model, Repository, Response, ResponseStatus, Request, SubRepository } from "./";
import * as Bridge from "./Bridge";

export enum ControllerStatus {
    Loading = "Loading",
    Loaded = "Loaded",
    Saving = "Saving",
    Saved = "Saved"
}
export class Controller<TModel extends Model> {
	constructor(unproxied: TModel, proxied:TModel) {
		this.Values = {
			Unproxied:unproxied,
			Proxied:proxied,
			Original:{},
			Current:{},
			Pending:{}
		}
	}
	public Values:{
		Unproxied: TModel,
		Proxied: TModel,		
		Original:Partial<TModel>,
		Current:Partial<TModel>,
        Pending:Partial<TModel>
	};	
	public ID:string = Guid.Create().toString();
	public get Context(): Context {
		return this.Values.Proxied.Context;
	}
	public get Type():Meta.Type{
		return this.Values.Proxied.GetType();
	}
	public get Repository():Repository<TModel>{
		return <Repository<TModel>>this.Context.GetRepository(this.Type.Name);
	}
	public get KeyProperty():Meta.Property{
		var result = this.Type.Attributes.PrimaryKey;
		if (result === undefined)
			throw new Error(`Model(${this.Type}) does not have a primary key`);
		return result;
	}
	public get KeyValue():number|string{
		return this.KeyProperty.GetValue(this.Values.Proxied);
	}
	
	

	public Load(values: Partial<TModel>) {
		if (values instanceof Model)
			throw new Error(`Invalid Loading Value`);

		for (var propertyName in values){
			var property = this.Type.GetProperty(propertyName)
			if (property !== undefined){
				var loadValue = property.GetValue(values);		
				if (property.Type.IsSubTypeOf(Model)){
					var childRepository = this.Context.GetRepository(property.Type.Name);					
					var localValue = childRepository.Local.Select(loadValue);
					if (localValue === undefined){
						switch (typeof(loadValue)){
							case "object":
								localValue = childRepository.Add(loadValue);
								property.SetValue(this.Values.Unproxied, localValue);
								var keyProperty = property.Type.Attributes.PrimaryKey;
								if (keyProperty !== undefined){
									var keyValue = keyProperty.GetValue(localValue);
									if (keyValue === undefined)
										keyValue = localValue.Controller.ID;
									// console.log(keyValue);
									property.SetValue(this.Values.Current, keyValue);
									property.SetValue(this.Values.Original, keyValue);
								}
								break;
							default:
								property.SetValue(this.Values.Unproxied, loadValue);
								property.SetValue(this.Values.Current, loadValue);
								property.SetValue(this.Values.Original, loadValue);
								break;
						}
					}					
				}
				else if (property.Type.IsSubTypeOf(SubRepository)){

				}
				else {
					var value = property.GetValue(values);
					property.SetValue(this.Values.Unproxied, value);
					property.SetValue(this.Values.Original, value);
					property.SetValue(this.Values.Current, value);
				}
	
			}			
		}
		this.Context.ChangeTracker.Add(this.Values.Proxied);
	}
	public Update(values:Partial<TModel>){
		for (var propertyName in values){
			var property = this.Values.Unproxied.GetType().GetProperty(propertyName)
			if (property !== undefined){
				var value = property.GetValue(values);
				property.SetValue(this.Values.Unproxied, value);
				property.SetValue(this.Values.Current, value);	
			}			
		}
		this.Context.ChangeTracker.Add(this.Values.Proxied);
	}
	public GetStatus():ChangeStatus{
		var repository = this.Context.GetRepository(this.Values.Proxied.GetType())
		var attached = repository.Items.find(x =>{
			return x === this.Values.Proxied;
		});
		if (! attached)
			return ChangeStatus.Detached;

		if (this.KeyValue === undefined)
			return ChangeStatus.Added;
		
		var modified = false;
		this.Values.Proxied.GetType().GetProperties().forEach(property=>{
			var currentValue = property.GetValue(this.Values.Current);
			var originalValue = property.GetValue(this.Values.Original);
			if (currentValue !== originalValue)
				modified = true;
		});
		if (modified)
			return ChangeStatus.Modified;
		else 
			return ChangeStatus.Unchanged;		
	}
}
