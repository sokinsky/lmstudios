import { Guid } from "./Utilities";
import { Meta } from "./";
import { ChangeStatus, Context, Model, Repository, Response, ResponseStatus, ResponseStatusType } from "./";
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
	public Sync:SyncController<TModel> = new SyncController(this);
	public Async:AsyncController<TModel> = new AsyncController(this);
	
	public get Context(): Context {
		return this.Model.Context;
	}
	
    
    public Saving: boolean = false;

    
    public Values:{
		Original:Partial<TModel>,
		Current:Partial<TModel>,
        Pending:Partial<TModel>
    } = {Original:{}, Current:{}, Pending:{}};

	public Load(values: Partial<TModel>) {
		this.Model.GetType().GetProperties().forEach(x => {
			var value = x.GetValue(values);
			if (x.Type){
				switch (x.Type.Name){
					case "Date":
						value = new Date(value);
						break;
				}
			}

			x.SetValue(this.Values.Original, value);
			x.SetValue(this.Model, value);			
			x.SetValue(this.Values.Current, value);
		});
	}
	public Update(values:Partial<TModel>){
		this.Model.GetType().GetProperties().forEach(x => {
			var value = x.GetValue(values);
			if (x.Type){
				switch (x.Type.Name){
					case "Date":
						value = new Date(value);
						break;
				}
			}
			x.SetValue(this.Model, value);			
			x.SetValue(this.Values.Current, value);
		});
	}

	public SetValue(arg1:Meta.Property|string, arg2:any){
		var property:Meta.Property|undefined;
		if (arg1 instanceof Meta.Property)
			property = arg1;
		else
			property = this.Model.GetType().GetProperty(arg1);
		var value = arg2;

		if (property !== undefined){
			if (property.Type){
				if (property.Type.IsSubTypeOf(Model)){
					if (value instanceof Model){
						property.SetValue(this.Model, value);
						if (value.Key === undefined)
							property.SetValue(this.Model.Controller.Values.Current, this.Model.Controller.Guid.Value)
						else
							property.SetValue(this.Model.Controller.Values.Current, value.Key);
					}
					else{
						property.SetValue(this.Model, value);
						property.SetValue(this.Model.Controller.Values.Current, value);
					}
				}
				else{
					property.SetValue(this.Model, value);
					property.SetValue(this.Model.Controller.Values.Current, value);
				}
			}
			else{
				property.SetValue(this.Model, value);
				property.SetValue(this.Model.Controller.Values.Current, value);
			}
		}	

		this.Context.ChangeTracker.Add(this.Model);
	}
	public GetValue(arg:Meta.Property|string){
		var property:Meta.Property|undefined;
		if (arg instanceof Meta.Property)
			property = arg;
		else
			property = this.Model.GetType().GetProperty(arg);
		if (property === undefined)
			return undefined;

		var result = property.GetValue(this.Model);
		if (result === null)
			return undefined;
		if (result === undefined)
			return undefined;
		if (property.Type !== undefined){
			if (property.Type.IsSubTypeOf(Model)){
				if (!(result instanceof Model)){
					var repository = this.Context.GetRepository(property.Type.Name);
					if (repository){
						var localValue = repository.Sync.Select(result);
						if (localValue === undefined){
							property.SetValue(this.Model, null);
							repository.Async.Select(result).then(serverValue=>{
								if (serverValue !== undefined && property !== undefined)
									property.SetValue(this.Model, serverValue);
							})
						}
						result = localValue;
					}				
				}
			}
		}
		return result;
	}
	public Bridge():Bridge.Model{
		var result = new Bridge.Model({
			ID:this.Guid.toString(),
			Type:this.Model.GetType().Name,
			Value:this.Values.Current
		});
		return result;
	}
	public GetStatus():ChangeStatus{
		var repository = this.Context.GetRepository(this.Model.GetType().Name)
		if (repository === undefined)
			throw new Error("");
		var attached = repository.Items.find(x =>{
			return x === this.Model;
		});
		if (! attached)
			return ChangeStatus.Detached;

		if (this.Model.Key === undefined)
			return ChangeStatus.Added;
		if (this.Model.Key === null)
			return ChangeStatus.Deleted;
		
		var modified = false;
		this.Model.GetType().GetProperties().forEach(property=>{
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

export class SyncController<TModel extends Model>{
	constructor(parent:Controller<TModel>){
		this.Parent = parent;
	}
	public Parent:Controller<TModel>;

	public GetValue(propertyArg:Meta.Property|string){
		let property:Meta.Property|undefined;
		if (typeof(propertyArg) === "string")
			property = this.Parent.Model.GetType().GetProperty(propertyArg);
		else if (propertyArg instanceof Meta.Property)
			property = propertyArg;	
			
		if (property === undefined)
			throw new Error(`Property(${propertyArg}) does not belong to Type(${this.Parent.Model.GetType().Name})`);
		
		var result = property.GetValue(this.Parent.Model);

		if (result === null)
			return result;
		
		if (property.Type){
			if(property.Type.IsSubTypeOf(Model)){
				if (! (result instanceof Model)){
					var repository = this.Parent.Context.GetRepository(property.Type);
					if (repository === undefined)
						throw new Error("");

					console.log(property);
					var localValue = repository.Sync.Select(result);
					if (localValue === undefined){
						result = null;
						repository.Async.Select(result).then(serverValue=>{
							result = serverValue;
						})
					}
				}
			}
		}
		return result;
	}

}
export class AsyncController<TModel extends Model>{
	constructor(parent:Controller<TModel>){
		this.Parent = parent;
	}
	public Parent:Controller<TModel>;

	public async GetValue(propertyArg:Meta.Property|string):Promise<any>{
		var property:Meta.Property|undefined;
		if (propertyArg instanceof Meta.Property)
			property = propertyArg;
		else
			property = this.Parent.Model.GetType().GetProperty(propertyArg);
		if (property === undefined)
			return undefined;

		var result = property.GetValue(this.Parent.Model);
		if (result === null)
			return undefined;
		if (result === undefined)
			return undefined;
		if (property.Type !== undefined){
			if (property.Type.IsSubTypeOf(Model)){
				if (!(result instanceof Model)){
					property.SetValue(this.Parent.Model, null);
					var repository = this.Parent.Context.GetRepository(property.Type.Name);
					if (repository){
						var localValue = repository.Sync.Select(result);
						if (localValue !== undefined){
							result = localValue;
						}
						else {							
							var serverValue = await repository.Async.Select(result);
							if (serverValue === undefined)
								result = null;
							else 
								result = serverValue;							
						}	
						property.SetValue(this.Parent.Model, result);					
					}				
				}
			}
		}
		return result;
	}
}
