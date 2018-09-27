import { Guid } from "@lmstudios/utilities";
import { Context, Model, Repository, Response, ResponseStatus, ResponseStatusType } from "./";
import * as Bridge from "./Bridge";

export enum ControllerStatus {
    Loading = "Loading",
    Loaded = "Loaded",
    Saving = "Saving",
    Saved = "Saved"
}
export class Controller<TContext extends Context, TModel extends Model> {
	constructor(context: TContext, model: TModel) {
		this.Context = context;
		this.Model = model;
	}
	public Context: TContext;
    public Model: TModel;
    public Saving: boolean = false;

    public Guid:Guid = Guid.Create();
    public Values:{
        Original:any,
        Pending:any
    } = {Original:{}, Pending:{}};

	public Load(values: Partial<TModel>) {
		this.Values.Original = values;
		this.Update(values);
	}
	public Update(values: Partial<TModel>) {
		if (this.Saving) {
			this.UpdatePending(values);
			return;
		}
		for (var propertyName in values) {
			this.UpdateProperty(propertyName, values[propertyName]);
		}
		this.ApplyPending();
	}
	public UpdateProperty(propertyName: string, newValue: any): boolean {
		if (this.Saving) {
			this.UpdatePendingProperty(propertyName, newValue);
			return false;
		}
		else {
			(<any>this.Model)[propertyName] = newValue;
			this.Context.ChangeTracker.Update(this.Model);
			return true;
		}
	}
	public UpdatePending(values:Partial<TModel>) {
		this.Values.Pending = values;
	}
	public UpdatePendingProperty(propertyName: string, newValue:any) {
        this.Values.Pending[propertyName] = newValue;	
	}
	public ApplyPending() {
        for (var propertyName in this.Values.Pending) {
            this.UpdateProperty(propertyName, this.Values.Pending[propertyName]);
        }
        this.Values.Pending = {};
	}

	public ReadProperty(propertyName: string): any {
		var result = (<any>this.Model)[propertyName];
		
		if (result === null)
			return result;

		switch (propertyName) {
			case "constructor":
				return result;
			case "toString":
				return result;
			default:
				if (propertyName.match(/^_/))
					return result;
				break;
		}

		if (result === undefined)
			result = null;
		var type = this.Model.GetType();
		let propertyInfo = type.GetProperty(propertyName);
		if (!propertyInfo)
			return result;

		if (result && propertyInfo.Type.Constructor.Method === result.constructor)
			return result;
		if (propertyInfo.Type.IsSubTypeOf(Model)) {
			if (result) {
				if (typeof (result) == "number") {
					result = { ID: result };
				}
				if (typeof (result) == "object") {
					var localResult = this.Context.GetRepository(propertyInfo.Name).Local.Select(result);
					if (localResult) {
						result = localResult;
						(<any>this.Model)[propertyName] = result;
					}						
					else if (! result._retrieving){
						result._retrieving = true;
						(<any>this.Model)[propertyName] = result;
						this.Context.GetRepository(propertyInfo.Name).Server.Select(result).then((serverModel) => {
							result = serverModel;
							(<any>this.Model)[propertyName] = serverModel;
						});
					}
				}
			}


		}
		else if (propertyInfo.Type.IsSubTypeOf(Repository)) {
			throw Error("Not Initialized");
		}
		else {
			result = propertyInfo.Type.Constructor.Invoke(result)
		}
		(<any>this.Model)[propertyName] = result;
		return result;
	}
	public Write(): any {
		var result: any = {};
		for (var propertyName in this.Model) {
			if (!propertyName.match(/^_/)) {
				var propertyValue = this.WriteProperty(propertyName);
				if (propertyValue !== undefined)
					result[propertyName] = propertyValue;
			}
				
		}
		return result;
	}
	public WriteProperty(propertyName: string): any {		
		var value = (<any>this.Model)[propertyName];
		if (value instanceof Model) {

		}
		else if (value instanceof Repository) {
			return undefined;
		}
		else {
			return value;
		}
	}
}
