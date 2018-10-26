import { Guid } from "./Utilities";
import { Meta } from "./";
import { ChangeStatus, Context, Model, Repository, Response, ResponseStatus, ResponseStatusType, SubRepository } from "./";
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
	public get Context(): Context {
		return this.Values.Proxied.Context;
	}	  

	public Load(values: Partial<TModel>) {
		for (var propertyName in values){
			var property = this.Values.Unproxied.GetType().GetProperty(propertyName)
			if (property !== undefined){
				if (! property.Type.IsSubTypeOf(SubRepository)){
					console.log(property);
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

	public Bridge():Bridge.Model{
		var result = new Bridge.Model({
			ID:this.Values.Proxied.Key.Guid.Value,
			Type:this.Values.Proxied.GetType().Name,
			Value:this.Values.Current
		});
		return result;
	}
	public GetStatus():ChangeStatus{
		var repository = this.Context.GetRepository(this.Values.Proxied.GetType())
		var attached = repository.Items.find(x =>{
			return x === this.Values.Proxied;
		});
		if (! attached)
			return ChangeStatus.Detached;

		if (this.Values.Proxied.Key.Value === undefined)
			return ChangeStatus.Added;
		if (this.Values.Proxied.Key.Value === null)
			return ChangeStatus.Deleted;
		
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
