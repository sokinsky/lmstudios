import { Guid } from "./Utilities";
import { Meta } from "./";
import { Context, Model, Repository, Response, ResponseStatus, ResponseStatusType } from "./";
import * as Bridge from "./Bridge";

export enum ControllerStatus {
    Loading = "Loading",
    Loaded = "Loaded",
    Saving = "Saving",
    Saved = "Saved"
}
export class Controller<TModel extends Model> {
	constructor(model: TModel) {
		this.Model = model;
	}
	public Guid:Guid = Guid.Create();
	public Model: TModel;
	public get Context(): Context {
		return this.Model.Context;
	}
    
    public Saving: boolean = false;

    
    public Values:{
        Original:Partial<TModel>,
        Pending:Partial<TModel>
    } = {Original:{}, Pending:{}};

	public Load(values: Partial<TModel>) {
		this.Values.Original = values;
		this.Model.GetType().GetProperties().forEach((property:Meta.Property) =>{
			property.SetValue(this.Model.Sync, property.GetValue(values));
		})
	}
	public Update(values: Partial<TModel>) {
		this.Model.GetType().GetProperties().forEach((property:Meta.Property) =>{
			this.UpdateProperty(property, (<any>values)[property.Name]);
		})
	}
	public UpdateProperty(property:Meta.Property, newValue: any) {
		if (this.Saving) {
			property.SetValue(this.Values.Pending, newValue);
			return;
		}
		property.SetValue(this.Model.Sync, newValue);
		this.Context.ChangeTracker.Update(this.Model);
	}

	public Write(): any {
		var result: any = {};
		this.Model.GetType().GetProperties().forEach((property:Meta.Property) => {
			result[property.Name] = this.WriteProperty(property);
		});
		return result;
	}
	public WriteProperty(property: Meta.Property): any {	
		var value = property.GetValue(this.Model.Sync);
		if (value instanceof Model) {
			return (<Model>value).Key;
		}
		else if (value instanceof Repository) {
			return undefined;
		}
		else {
			return value;
		}
	}
}
