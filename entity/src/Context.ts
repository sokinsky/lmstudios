import { Assembly, ConstructorInfo, Type} from "@lmstudios/reflection";
import { API, Application, Model, Repository, Request, Response, ResponseStatusType} from './'
import * as Bridge from "./Bridge";

export class Context {
	constructor(application:Application, assembly:string|Assembly, api:string|API) {
 		var proxy: Context | undefined = new Proxy(this, {
			get: (target, propertyName: string | number | symbol, reciever) => {
				return Reflect.get(target, propertyName, reciever);
			},
			set: (target, propertyName: string | number | symbol, propertyValue, reciever) => {
				if (propertyValue instanceof Repository)
					(<any>propertyValue).Parent.Property = propertyName;
				return Reflect.set(target, propertyName, propertyValue, reciever);

			}
		}); 
		this.Application = application;
		if (typeof(assembly) == "string"){
			var check = this.Application.GetAssembly(assembly);
			if (!check)
				throw Error("");
			this.Assembly = check
		}
		else{
			this.Assembly = <Assembly>assembly;
		}
		this.Name = this.Assembly.Name;
 		if (typeof(api) == "string")
			this.API = new API(this, api);
		else
			this.API = api;
		return proxy;
	}
	public Name:string;
	public Application: Application;
	public Assembly:Assembly; 
	
	public API:API;
	public ChangeTracker: ChangeTracker = new ChangeTracker(this);

 	public GetRepository(type?: Type | (new (...args: any[]) => Model) | string): Repository<Model> {
		var getType = undefined;
		if (!(type instanceof Type)) {
			switch (typeof (type)) {
				case "string":
					getType = this.Application.GetType(<string>type);
					break;
				case "function":
					getType = this.Application.GetType(<new (...args: any[]) => Model>type);
					break;
			}
		}
		else {
			getType = <Type>type;
		}
		if (!getType)
			throw new Error("");

		var constructor: ConstructorInfo = getType.Constructor;

		let results: Repository<Model>[] = [];
		let result: Repository<Model> | undefined;
		for (var key in this) {
			var repo = (<any>this)[key];
			if (repo instanceof Repository) {
				if (repo.Type.Constructor.Method == constructor.Method)
					results.push(repo);
			}
		}
		switch (results.length) {
			case 0:
				throw Error(`Repository(Type:${getType.Name}) could not be found.`);
			case 1:
				return results[0];
			default:
				throw Error(`Repository(Type:${getType.Name}) is ambiguous`)
		}
	} 
	public async Initialize() {
		let request = new Request("Context/Initialize", {});
		let response = await request.Post(this.API);
		this.Load(response);
	}
	public async Load(response: Response) {
		let bridgeModels: Array<Bridge.Model> = [];
		if (Array.isArray(response.Result))
			bridgeModels = response.Result.map(x => new Bridge.Model(x));
		bridgeModels.forEach((bridgeModel: Bridge.Model) => {
			var dataModel: Model | undefined = this.GetRepository(bridgeModel.Type).Local.Select(bridgeModel.Value);			
			if (!dataModel)
				dataModel = this.GetRepository(bridgeModel.Type).Add();
			dataModel.__controller.Load(bridgeModel.Value);
		});
	}
	public async SaveChanges(): Promise<Response | undefined> {
		let bridgeModels: Array<Bridge.Model> = [];
		this.ChangeTracker.Entries().forEach((entry: ChangeEntry) => {	
			var bridgeModel = new Bridge.Model({
				ID:entry.Model.__controller.Guid.toString(),
				Type: entry.Model.GetType().Name,
				Value: entry.Model.__controller.Write()
			});

			bridgeModels.push(bridgeModel);			
		});
		let request = new Request("Context/SaveChanges", bridgeModels);
		let response = await request.Post(this.API);
		if (response.Status.Type == ResponseStatusType.OK) {
			this.ChangeTracker.Clear();
			this.Load(response);
		}			
		return response;
	}	

	public GetType(): Type {
		let result: Type | undefined = this.Application.GetType(this);
		if (!result)
			throw new Error("");
		return result;
	} 
}
export class ChangeTracker {
	constructor(context: Context) {
		this.Context = context;
	}
	public Context: Context;
	private _entries: Array<ChangeEntry> = [];
	public Entries() : Array<ChangeEntry> {
		return this._entries;
	}
	public Add(entry: ChangeEntry) {
		this._entries.push(entry);
	}
	public Remove(entry: ChangeEntry) {
		var index = this._entries.indexOf(entry);
		if (index >= 0)
			this._entries.splice(index, 1);
	}
	public Update(model: Model) {
		let state: ChangeState = this.getState(model);
		let entry: ChangeEntry | undefined = this._entries.find((item) => {
			return item.Model === model
		});
		switch (state) {
			case ChangeState.Unchanged:
				if (entry)
					this.Remove(entry);
				break;
			default:
				if (!entry) {
					entry = new ChangeEntry(state, model);
					this.Add(entry);
				}
				break;
		}
	}
	public Clear() {
		this._entries = [];
	}

	private getState(model: Model): ChangeState {
		return ChangeState.Unchanged;
	}
}
export enum ChangeState {
	Unchanged = "Unchanged",
	Added = "Added",
	Removed = "Removed",
	Modified = "Modified"
}
export class ChangeEntry {
	constructor(state: ChangeState, model: Model) {
		this.State = state;
		this.Model = model;
	}

	public State: ChangeState;
	public Model: Model;

}