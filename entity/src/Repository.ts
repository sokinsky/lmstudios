import { Assembly, ConstructorInfo, PropertyInfo, Type } from "../../Reflection";
import { Context, Controller, Model, Request, Response, ResponseStatus, ResponseStatusType } from "./";
import * as Attributes from "./Attributes";
import * as Bridge from "./Bridge";

export class Repository<TModel extends Model> {
	constructor(parent: Context | Model, type: (new (...args: any[]) => TModel)) {
		this.Parent = {
			Value:parent
		}
		var checkContext:Context|undefined;
		if (parent instanceof Context){
			checkContext = parent;
		}
		else if (parent instanceof Model){
			this.Model = parent;
			checkContext = this.Model.__controller.Context;
		}
		if (! checkContext)
			throw new Error("Unable to continue without a context");
		this.Context = checkContext;

		var checkType:Type|undefined = this.Context.Application.GetType(type);
		if (! checkType)
			throw new Error("Unable to continue without a type");
		this.Type = checkType;


		this.Local = new LocalRepository(this);
		this.Server = new ServerRepository(this);
	}

	public Parent: { Value:Context|Model, Property?:PropertyInfo }
	public Type: Type;

	public Context: Context 
	public Model: Model | undefined 
	
	private _items?: TModel[];
	public get Items(): TModel[] {
		if (!this._items)
			this.Intialize();
		if (!this._items)
			this._items = [];
		return this._items;
	}
	public *[Symbol.iterator]() {
		for (const value of this.Items) {
			yield value;
		}
	}
    public Local: LocalRepository<TModel>;
	public Server: ServerRepository<TModel>;

	public Intialize(): TModel[] {		
		if (this._items !== undefined)
			return this._items;
		return [];
		//if (this._items) {
		//	console.warn("Repo Items have already been initialized");
		//	return;
		//}
		//this._items = [];
		//if (this.Parent instanceof Model && this.Parent.ID) {
		//	var request = {
		//		Type: this.Parent.GetType().Name,
		//		Value: this.Parent.ID,
		//		PropertyName: this.ParentPropertyName
		//	};
		//	var response = this.Context.API.Post("Model/Property", request).then((response) => {
		//		if (response && response.Status.Type == ResponseStatusType.OK) {					
		//			this.Context.Load(response);

		//			var parentType: Type = (<TModel>this.Parent).GetType();
		//			var childType: Type | undefined= this.Context.Assembly.GetType(this.Type);
		//			if (childType) {
		//				var childProperties = childType.GetProperties(parentType.Constructor);
		//				for (var key in childProperties) {
		//					var add = this.Context.GetRepository(childType.Constructor).Items.filter((item: Model) => {
		//						console.log(item);
		//						//var parentValue = item.__controller.ReadProperty(key);
		//						var parentProperty = key;
		//						//console.log(parentProperty);
		//						var parentPropertyValue = (<any>Model)[parentProperty];
		//						//console.log(parentPropertyValue);
		//						//return (parentValue == this.Parent)
		//						return true;
		//					});
		//					add.forEach(item => {
		//						this.Add(<TModel>item);
		//					})
		//					console.log(add);
		//				}
		//			}

		//		}
		//	});
		//}

	}

	public async Select(value: TModel | Partial<TModel> | number | string): Promise<TModel | undefined> {
		var result = this.Local.Select(value);
		if (!result)
			result = await this.Server.Select(value);
		return result;
	}



	public Create(value?: Partial<TModel>) {
		let result: TModel = <TModel>this.Type.Create(this.Context);
		if (value)
			result.__controller.Load(value);
		return result;
	}
	public Add(value?: TModel | Partial<TModel>): TModel {
		let result: TModel | undefined;
		if (!value) {
			result = this.Create();
			this.Items.push(result);
		}
		else if (!(value instanceof Model)) {
			result = this.Local.Select(value);
			if (result == null) {
				result = this.Create(value);
				this.Items.push(result);
			}
		}
		else {
			result = this.Items.find((item: TModel) => {
				return item === value;
			});
			if (!result) {
				result = value;
				this.Items.push(result);
			}
		}
		return result;
	}
}
export class LocalRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
    public Repository: Repository<TModel>;

    public Select(value: TModel | Partial<TModel> | number | string) : TModel | undefined {
		let result:TModel|undefined;

		let keyProperties:PropertyInfo[] = this.Repository.Type.GetProperties(Attributes.Key);
		console.log(keyProperties);

/* 		let keyProperty:PropertyInfo|undefined = this.Repository.Type.GetProperties().find

		let uniqueProperties:PropertyInfo[] = this.Repository.Type.GetProperties().filter((propertyInfo:PropertyInfo)=>{
			var attribute = propertyInfo.Attributes.find(item=>{
				return (item instanceof Attributes.Unique);
			});
			return (attribute !== undefined)
		});
		
		let results:TModel[] = this.Repository.Items.slice();
		switch (typeof(value)){
			case "string":
				if (uniqueProperties.length == 1)
					result = 
		}
		if (uniqueProperties){
			uniqueProperties.forEach((propertyInfo:PropertyInfo)=>{
				results = results.filter((x:Model) => {
					
				})
			})
		}*/
        return undefined; 
    }
}
export class ServerRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
    public Repository: Repository<TModel>;

	public async Select(value: TModel | Partial<TModel> | number | string): Promise<TModel | undefined> {
        return undefined;
    }
}